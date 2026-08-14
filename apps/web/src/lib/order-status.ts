export const ORDER_STATUS_LABELS: Record<string, string> = {
  submitted: "Reçue",
  acknowledged: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  completed: "Livrée",
  cancelled: "Annulée",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
