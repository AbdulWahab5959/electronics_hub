import { Clock } from '@phosphor-icons/react/dist/csr/Clock';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { Truck } from '@phosphor-icons/react/dist/csr/Truck';
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircle } from '@phosphor-icons/react/dist/csr/XCircle';
import { statusLabel, orderStatuses } from '../../utils/orders';

export function OrderStatusBadge({ status }) {
  const Icon = { pending: Clock, processing: Package, shipped: Truck, delivered: CheckCircle, cancelled: XCircle }[status] || Package;
  return <span className={'history-status ' + (orderStatuses.includes(status) ? status : 'unknown')}><Icon size={16} aria-hidden="true" />{statusLabel(status)}</span>;
}
