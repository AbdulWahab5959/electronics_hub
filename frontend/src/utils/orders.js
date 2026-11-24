export const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
export const progressSteps = ['pending', 'processing', 'shipped', 'delivered'];
const labels = { active: 'In progress', pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
const descriptions = {
  pending: 'Your order has been received and is waiting to be processed.',
  processing: 'Your order is being prepared.',
  shipped: 'Your order has been marked as shipped.',
  delivered: 'Your order has been marked as delivered.',
  cancelled: 'This order has been cancelled.',
};
export const statusLabel = status => labels[status] || String(status || 'Unknown').replaceAll('_', ' ');
export const statusDescription = status => descriptions[status] || 'Refresh the status for the latest information about this order.';
export const paymentLabel = status => ({ awaiting_collection: 'Pay on delivery', paid: 'Paid', cancelled: 'Cancelled', refunded: 'Refunded', failed: 'Payment failed' }[status] || String(status || 'Unknown').replaceAll('_', ' '));
export const canCancelOrder = order => order?.status === 'pending' && order?.payment_status === 'awaiting_collection';
export const itemCount = items => (Array.isArray(items) ? items : []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
export function formatOrderDate(value, withTime = false) {
  const date = new Date(value);
  if (!value || !Number.isFinite(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PK', { timeZone: 'Asia/Karachi', dateStyle: 'medium', ...(withTime ? { timeStyle: 'short' } : {}) }).format(date) + (withTime ? ' PKT' : '');
}
export function filterOrders(orders, query, status) {
  const needle = String(query || '').normalize('NFKC').trim().toLocaleLowerCase();
  return orders.filter(order => (status === 'all' || (status === 'active' ? ['pending', 'processing', 'shipped'].includes(order.status) : order.status === status)) && (!needle || [order.order_number, ...(order.items || []).map(item => item.name)].some(text => String(text || '').normalize('NFKC').toLocaleLowerCase().includes(needle))));
}
export function orderPage(orders, requestedPage, perPage = 8) {
  const pages = Math.max(1, Math.ceil(orders.length / perPage));
  const page = Math.min(pages, Math.max(1, Number.parseInt(requestedPage, 10) || 1));
  return { page, pages, items: orders.slice((page - 1) * perPage, page * perPage), from: orders.length ? (page - 1) * perPage + 1 : 0, to: Math.min(page * perPage, orders.length) };
}
