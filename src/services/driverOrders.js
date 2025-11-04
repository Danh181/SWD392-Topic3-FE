import API from './auth';

/**
 * Driver Orders Management APIs
 * Endpoints for driver to manage their swap orders
 */

/**
 * Get driver's order history by status
 * @param {string} status - TransactionStatus: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELED
 * @returns {Promise<Array>} List of swap transactions
 */
export async function getOrderHistory(status) {
  try {
    const params = status ? { status } : {};
    const res = await API.get('/api/swap/history', { params });
    const data = res?.data?.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ [Driver Orders] Failed to get order history:', error?.response?.data || error);
    throw error;
  }
}

/**
 * Get all orders for driver (all statuses)
 * @returns {Promise<Array>} Complete order history
 */
export async function getAllOrders() {
  try {
    // Fetch orders by different statuses
    const [scheduled, confirmed, inProgress, completed, canceled] = await Promise.allSettled([
      getOrderHistory('SCHEDULED'),
      getOrderHistory('CONFIRMED'), 
      getOrderHistory('IN_PROGRESS'),
      getOrderHistory('COMPLETED'),
      getOrderHistory('CANCELED')
    ]);

    // Combine all successful results
    const allOrders = [];
    [scheduled, confirmed, inProgress, completed, canceled].forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allOrders.push(...result.value);
      }
    });

    return allOrders.sort((a, b) => new Date(b.scheduledTime || b.arrivalTime) - new Date(a.scheduledTime || a.arrivalTime));
  } catch (error) {
    console.error('❌ [Driver Orders] Failed to get all orders:', error);
    return [];
  }
}

/**
 * Create payment for a confirmed order
 * Uses /api/payment/process (GET method as per backend)
 * @param {string} transactionId - UUID of the transaction
 * @param {string} paymentMethod - 'VNPAY' or 'CASH'
 * @returns {Promise<Object>} Payment response with redirect URL or confirmation
 */
export async function createPayment(transactionId, paymentMethod) {
  try {
    // Backend uses GET /api/payment/process with query params
    const res = await API.get('/api/payment/process', {
      params: {
        transactionId,
        method: paymentMethod
      }
    });
    const data = res?.data?.data;
    
    return data;
  } catch (error) {
    console.error('❌ [Driver Payment] Failed to create payment:', error?.response?.data || error);
    throw error;
  }
}

/**
 * Get payment status for a transaction
 * Uses /api/swap/{transactionId} to get transaction with payments
 * @param {string} transactionId - UUID of the transaction
 * @returns {Promise<Object>} Payment status and details
 */
export async function getPaymentStatus(transactionId) {
  try {
    // Use existing transaction API to get payment info
    const res = await API.get(`/api/swap/${transactionId}`);
    const transaction = res?.data?.data;
    
    // Extract latest payment from transaction
    if (transaction?.payments && transaction.payments.length > 0) {
      // Get latest payment (assuming sorted by date desc or first is latest)
      const latestPayment = transaction.payments[0];
      return {
        status: latestPayment.status,
        method: latestPayment.method,
        amount: latestPayment.amount,
        paymentDate: latestPayment.paymentDate
      };
    }
    
    // No payment found
    return null;
  } catch (error) {
    console.error('❌ [Driver Payment] Failed to get payment status:', error?.response?.data || error);
    throw error;
  }
}

/**
 * Get transaction status text for display
 * @param {string} status - TransactionStatus enum value
 * @returns {string} Localized status text
 */
export function getTransactionStatusText(status) {
  const statusMap = {
    'SCHEDULED': 'Đã đặt lịch',
    'CONFIRMED': 'Đã xác nhận', 
    'IN_PROGRESS': 'Đang xử lý',
    'COMPLETED': 'Hoàn thành',
    'CANCELED': 'Đã hủy'
  };
  return statusMap[status] || status;
}

/**
 * Check if order can be paid (status is CONFIRMED and has confirmedStaffId)
 * @param {Object} order - Swap transaction object
 * @returns {boolean} True if order can be paid
 */
export function canPayOrder(order) {
  return order?.status === 'CONFIRMED' && order?.confirmedStaffId;
}

/**
 * Get order type text for display
 * @param {string} type - SwapType enum value  
 * @returns {string} Localized type text
 */
export function getOrderTypeText(type) {
  const typeMap = {
    'SCHEDULED': 'Đặt lịch',
    'WALK_IN': 'Tại chỗ'
  };
  return typeMap[type] || type;
}