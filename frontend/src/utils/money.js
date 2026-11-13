export const formatMoney = value => new Intl.NumberFormat('en-PK', {
  style: 'currency', currency: 'PKR', minimumFractionDigits: 2,
}).format(Number(value ?? 0));
