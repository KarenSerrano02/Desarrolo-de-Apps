export interface Place { name: string; lat: number; lng: number; }

// Lugares de referencia (Bogotá) para elegir origen/destino sin mapa.
export const PLACES: Place[] = [
  { name: 'Parque de la 93', lat: 4.6766, lng: -74.0483 },
  { name: 'Centro Comercial Andino', lat: 4.6664, lng: -74.0536 },
  { name: 'Usaquén', lat: 4.695, lng: -74.0305 },
  { name: 'Universidad Nacional', lat: 4.6382, lng: -74.084 },
  { name: 'Plaza de Bolívar', lat: 4.5981, lng: -74.076 },
  { name: 'Aeropuerto El Dorado', lat: 4.7016, lng: -74.1469 },
];

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
