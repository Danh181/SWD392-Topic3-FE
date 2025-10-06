import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getAccessToken, clearTokens, getProfile } from '../services/auth';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    // If decoding fails, return null (token missing or malformed)
    console.warn('parseJwt failed', e);
    return null;
  }
}

function userFromTokenPayload(payload) {
  if (!payload) return null;
  
  const username = payload.username || payload.sub || payload.email || payload.name || null;
  
  
  const extractRoles = (p) => {
    if (!p) return [];
    let vals = [];
    if (p.role) vals = Array.isArray(p.role) ? p.role : [p.role];
    else if (p.roles) vals = Array.isArray(p.roles) ? p.roles : [p.roles];
    else if (p.authorities) vals = Array.isArray(p.authorities) ? p.authorities : [p.authorities];
  
    vals = vals.map(v => {
      if (!v) return null;
      if (typeof v === 'string') return v;
      if (typeof v === 'object') return v.authority || v.role || v.name || JSON.stringify(v);
      return String(v);
    }).filter(Boolean);
  
    return vals.map(s => s.replace(/^ROLE_/, '').toUpperCase());
  };

  const roles = extractRoles(payload);
  const role = roles.length ? roles[0] : null;

  return { username, role, roles, raw: payload };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = parseJwt(token);
      const derived = userFromTokenPayload(payload);
      if (derived) {
        (async () => {
          try {
            const profile = await getProfile();
            if (profile) {
              setUser(profile);
              try { localStorage.setItem('user', JSON.stringify(profile)); } catch (e) { console.warn('localStorage.setItem failed', e); }
            } else {
              setUser(derived);
              try { localStorage.setItem('user', JSON.stringify(derived)); } catch (e) { console.warn('localStorage.setItem failed', e); }
            }
          } catch (e) {
            // Failed to fetch profile; keep derived user
            console.warn('getProfile failed', e);
            setUser(derived);
            try { localStorage.setItem('user', JSON.stringify(derived)); } catch (e) { console.warn('localStorage.setItem failed', e); }
          }
        })();
        setIsAuthenticated(true);
        return;
      }
    }
  
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = (userProfile, tokens) => {
  
    if (userProfile) {
      setUser(userProfile);
      try { localStorage.setItem('user', JSON.stringify(userProfile)); } catch {}
    } else if (tokens?.accessToken) {
      const payload = parseJwt(tokens.accessToken);
      const derived = userFromTokenPayload(payload);
      if (derived) {
  
        setUser(derived);
        try { localStorage.setItem('user', JSON.stringify(derived)); } catch {}
  
        (async () => {
          try {
            const profile = await getProfile();
            if (profile) {
              setUser(profile);
              try { localStorage.setItem('user', JSON.stringify(profile)); } catch (e) { console.warn('localStorage.setItem failed', e); }
            }
          } catch (e) {
            console.warn('getProfile failed', e);
          }
        })();
      }
    }

  
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
  try { localStorage.removeItem('user'); } catch (e) { console.warn('localStorage.removeItem failed', e); }
    clearTokens();
    setIsAuthenticated(false);
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (!role) return false;
    const wanted = role.replace(/^ROLE_/, '').toUpperCase();
    if (user.roles && Array.isArray(user.roles)) return user.roles.includes(wanted);
    return user.role === wanted;
  };
  const providerValue = useMemo(() => ({ user, setUser, isAuthenticated, login, logout, hasRole }), [user, isAuthenticated]);

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

AuthProvider.propTypes = {
  children: PropTypes.node,
};
