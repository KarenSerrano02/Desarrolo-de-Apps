export interface Point { name: string; lat: number; lng: number; }

// Neiva, Huila
export const NEIVA_CENTER = { lat: 2.9273, lng: -75.2819 };
// Caja de búsqueda: izquierda,arriba,derecha,abajo
const NEIVA_BOX = '-75.40,3.04,-75.16,2.84';

/** Busca direcciones o lugares dentro de Neiva (OpenStreetMap / Nominatim, gratis y sin API key). */
export async function searchPlaces(q: string): Promise<Point[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=co&bounded=1&accept-language=es' +
    `&viewbox=${NEIVA_BOX}&q=${encodeURIComponent(q + ', Neiva')}`;
  const res = await fetch(url);
  const rows = (await res.json()) as any[];
  return rows.map((r) => ({
    name: String(r.display_name).split(',').slice(0, 2).join(',').trim(),
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}

/** Nombre legible para un punto tocado en el mapa. */
export async function reverseName(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&accept-language=es&lat=${lat}&lon=${lng}`;
    const r = await (await fetch(url)).json();
    const a = r.address ?? {};
    const street = [a.road, a.house_number].filter(Boolean).join(' ');
    return [street || r.name, a.suburb || a.neighbourhood].filter(Boolean).join(', ') || 'Punto en el mapa';
  } catch {
    return 'Punto en el mapa';
  }
}

export interface PaymentMethod { id: string; label: string; hint: string; }

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', label: 'Efectivo', hint: 'Pagas al conductor' },
  { id: 'card', label: 'Tarjeta', hint: 'Débito o crédito' },
  { id: 'nequi', label: 'Nequi', hint: 'Pago desde la app' },
  { id: 'daviplata', label: 'Daviplata', hint: 'Pago desde la app' },
];

export const paymentLabel = (id?: string) => PAYMENT_METHODS.find((m) => m.id === id)?.label ?? 'Efectivo';

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Sin geolocalización'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(e),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}
