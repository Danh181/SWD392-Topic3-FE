import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// axios instance
const API = axios.create({
	baseURL: BASE_URL,
	headers: { 'Content-Type': 'application/json' },
});

// Token helpers
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getAccessToken() {
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
	return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens({ accessToken, refreshToken }) {
	if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Attach Authorization header automatically when access token exists
API.interceptors.request.use(cfg => {
	const token = getAccessToken();
	if (token) {
		cfg.headers = cfg.headers || {};
		cfg.headers.Authorization = `Bearer ${token}`;
	}
	return cfg;
});

// Optional: central error parsing for API responses wrapped in ApiResponse
function parseApiError(err) {
	if (err.response && err.response.data) {
		const body = err.response.data;
		// validation errors may have fieldErrors
		if (body.fieldErrors) return { message: body.message || 'Validation error', fieldErrors: body.fieldErrors };
		if (body.message || body.error) return { message: body.message || body.error };
	}
	return { message: err.message || 'Unknown error' };
}

// Auth methods
export async function register(payload) {
	// payload must match RegisterRequest: email, password, confirmPassword, phone, firstName, lastName, dateOfBirthStr, identityNumber
	try {
		const res = await API.post('/api/auth/register', payload);
		return res.data; // ApiResponse<RegisterResponse>
	} catch (err) {
		throw parseApiError(err);
	}
}

export async function login({ email, password }) {
	try {
		const res = await API.post('/api/auth/login', { email, password });
		const api = res.data; // { message, data }
		const data = api?.data || {};
		setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
		return api;
	} catch (err) {
		throw parseApiError(err);
	}
}

export async function refresh(refreshToken) {
	try {
		const token = refreshToken || getRefreshToken();
		const res = await API.post('/api/auth/refresh', { refreshToken: token });
		const api = res.data;
		const data = api?.data || {};
		if (data.accessToken) setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
		return api;
	} catch (err) {
		throw parseApiError(err);
	}
}

export async function logout() {
	try {
		// interceptor already attaches access token
		await API.post('/api/auth/logout', {});
		clearTokens();
		return { message: 'Logged out' };
	} catch (err) {
		// still clear tokens locally
		clearTokens();
		throw parseApiError(err);
	}
}

export default API;