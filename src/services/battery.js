import API from './auth';

/**
 * Battery Management APIs
 * All endpoints require ADMIN role unless specified
 */

// ============= Battery CRUD =============

/**
 * Get all batteries (paginated)
 * Role: ADMIN
 * @param {number} page - Page index (1-based for backend)
 * @param {number} size - Page size
 */
export async function getAllBatteries(page = 1, size = 20) {
  const res = await API.get('/api/battery/all', { params: { page, size } });
  const data = res?.data?.data;
  // Support both array and paginated { content: [] } shapes
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * Get battery details by ID
 * Role: ADMIN
 * @param {string} batteryId - UUID of battery
 */
export async function getBatteryById(batteryId) {
  const res = await API.get(`/api/battery/${batteryId}`);
  return res?.data?.data;
}

/**
 * Add new battery to a station
 * Role: ADMIN (but endpoint expects STAFF context with stationId from auth)
 * Note: BE expects currentStationId from authenticated user (STAFF role)
 * For ADMIN use case, we'll need to pass stationId explicitly if BE supports it
 * @param {object} payload - Battery creation data
 */
export async function addNewBattery(stationId, payload) {
  const res = await API.post(`/api/battery/station/${stationId}`, payload);
  return res?.data?.data;
}

/**
 * Get battery inventory for a station by status
 * Role: STAFF
 * @param {string} status - BatteryStatus enum value
 * @param {number} page - Page index (1-based)
 */
export async function getBatteryInventory(status, page = 1) {
  const params = { page };
  if (status) params.status = status;
  const res = await API.get('/api/battery/inventory', { params });
  return res?.data?.data ?? [];
}

// ============= Battery Model CRUD =============

/**
 * Define/create a new battery model
 * Role: ADMIN
 * @param {object} payload - DefineBatteryModelRequest
 */
export async function defineBatteryModel(payload) {
  const res = await API.post('/api/battery/model', payload);
  return res?.data?.data;
}

/**
 * Get all battery models (paginated)
 * Role: Public (no auth required based on BE @GetMapping without @PreAuthorize)
 * @param {number} page - Page index (1-based for backend)
 * @param {number} size - Page size
 */
export async function getAllBatteryModels(page = 1, size = 20) {
  const res = await API.get('/api/battery/model', { params: { page, size } });
  const data = res?.data?.data;
  // Support both array and paginated { content: [] } shapes
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * Alias for getAllBatteryModels - for driver use case
 * @param {number} page - Page index (1-based), optional
 */
export const getBatteryModels = getAllBatteryModels;

/**
 * Update a battery model
 * Role: ADMIN
 * @param {string} modelId - UUID of battery model
 * @param {object} payload - UpdateBatteryModelRequest
 */
export async function updateBatteryModel(modelId, payload) {
  const res = await API.patch(`/api/battery/model/${modelId}`, payload);
  return res?.data?.data;
}

// ============= Helper for fetching batteries by station =============
// Note: BE doesn't have direct endpoint for this, but we can filter client-side
// or use inventory endpoint if we have staff access to that station

/**
 * Get batteries for a specific station by status
 * Role: Requires authentication
 * @param {string} stationId - Station UUID
 * @param {string} status - BatteryStatus enum: FULL, IN_USE, CHARGING, MAINTENANCE, FAULTY, RETIRED
 * @param {number} page - Page index (1-based)
 */
export async function getBatteriesByStationAndStatus(stationId, status, page = 1) {
  const res = await API.get(`/api/battery/station/${stationId}/status`, {
    params: { status, page }
  });
  const data = res?.data?.data;
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
}

/**
 * Get all batteries for a specific station (FULL status = ready to use)
 * @param {string} stationId - Station UUID
 */
export async function getBatteriesByStation(stationId) {
  // Get batteries with FULL status (ready to rent/swap)
  try {
    return await getBatteriesByStationAndStatus(stationId, 'FULL', 1);
  } catch (error) {
    console.error('Failed to get batteries by station:', error);
    return [];
  }
}

// ============= Battery Monitoring APIs (Real-time) =============

/**
 * Get real-time battery states for a station
 * Role: STAFF, ADMIN
 * @param {string} stationId - Station UUID
 * @returns {Promise<Array>} Array of BatteryState objects
 */
export async function getBatteryStatesByStation(stationId) {
  const res = await API.get(`/api/battery-monitoring/station/${stationId}`);
  return res?.data?.data ?? [];
}

/**
 * Get real-time battery state for a single battery
 * Role: STAFF, ADMIN
 * @param {string} batteryId - Battery UUID
 * @returns {Promise<Object>} BatteryState object
 */
export async function getBatteryStateById(batteryId) {
  const res = await API.get(`/api/battery-monitoring/battery/${batteryId}`);
  return res?.data?.data;
}

/**
 * Get SSE connection statistics (admin only)
 * Role: ADMIN
 * @returns {Promise<Object>} Connection stats
 */
export async function getMonitoringStats() {
  const res = await API.get('/api/battery-monitoring/stats');
  return res?.data?.data ?? {};
}

/**
 * Create SSE connection for real-time battery monitoring
 * Role: STAFF, ADMIN
 * @param {string} stationId - Station UUID
 * @param {string} token - JWT token for authentication
 * @returns {EventSource} SSE connection
 */
export function createBatteryMonitoringStream(stationId, token) {
  const baseURL = API.defaults.baseURL || '';
  const url = `${baseURL}/api/battery-monitoring/stream/${stationId}`;
  
  // EventSource doesn't support custom headers, so we pass token as query param
  // or use a library that supports headers
  const eventSource = new EventSource(url, {
    withCredentials: true
  });
  
  return eventSource;
}
