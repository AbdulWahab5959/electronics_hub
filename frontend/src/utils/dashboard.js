export const isActiveOrder = order => ['pending', 'processing', 'shipped'].includes(order.status);
export function dashboardSummary(orders) {
  return { total: orders.length, active: orders.filter(isActiveOrder).length,
    // Integer minor units. COD order value is not money collected.
    deliveredMinor: orders.filter(order => order.status === 'delivered' && order.currency === 'PKR')
      .reduce((total, order) => total + Math.round(Number(order.total) * 100), 0) };
}
export function dashboardOrders(orders, view) {
  return orders.filter(order => view === 'active' ? isActiveOrder(order) : view === 'delivered' ? order.status === 'delivered' : true)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id - a.id);
}
