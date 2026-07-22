import { OrderStatus } from '@prisma/client';

export const orderStatusMessages: Record<OrderStatus, string> = {
  pending: 'Porudzbina je primljena',
  confirmed: 'Porudzbina je potvrdjena',
  preparing: 'Porudzbina se priprema',
  ready: 'Porudzbina je spremna',
  out_for_delivery: 'Porudzbina je krenula na dostavu',
  delivered: 'Porudzbina je dostavljena',
  completed: 'Porudzbina je zavrsena',
  cancelled: 'Porudzbina je otkazana',
};
