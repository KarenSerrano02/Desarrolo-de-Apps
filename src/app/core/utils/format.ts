export const cop = (n: number | string | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n ?? 0));

export const STATUS_LABEL: Record<string, string> = {
  requested: 'Buscando conductor', assigned: 'Conductor asignado', driver_arrived: 'Conductor en el punto',
  in_progress: 'En viaje', completed: 'Finalizado', cancelled: 'Cancelado',
};
