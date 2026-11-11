import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { NEIVA_CENTER } from '../core/data/places';

export interface LatLng { lat: number; lng: number; }

const dot = (color: string) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.35)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const car = L.divIcon({
  className: '',
  html: '<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#fbbf24;border:3px solid #fff;font-size:15px">🚗</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

@Component({
  selector: 'app-route-map',
  standalone: true,
  template: '<div #host class="map" [style.height]="height" role="img" aria-label="Mapa de la ruta"></div>',
  styles: [':host{display:block} .map{width:100%;border-radius:14px;overflow:hidden;border:1px solid var(--u-border)}'],
})
export class RouteMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  @Input() origin: LatLng | null = null;
  @Input() dest: LatLng | null = null;
  @Input() driver: LatLng | null = null;
  @Input() height = '260px';
  @Input() pickable = false;
  @Output() picked = new EventEmitter<LatLng>();

  private map?: L.Map;
  private layer = L.layerGroup();
  private seq = 0;

  ngAfterViewInit() {
    this.map = L.map(this.host.nativeElement, { zoomControl: false, attributionControl: true }).setView([NEIVA_CENTER.lat, NEIVA_CENTER.lng], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.layer.addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.pickable) this.picked.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    // Ionic monta la vista con animación: se recalcula el tamaño al terminar.
    setTimeout(() => { this.map?.invalidateSize(); this.draw(); }, 250);
  }

  ngOnChanges() { this.draw(); }
  ngOnDestroy() { this.map?.remove(); }

  private async draw() {
    const map = this.map;
    if (!map) return;
    const id = ++this.seq;
    this.layer.clearLayers();
    const pts: L.LatLngExpression[] = [];

    if (this.origin) { L.marker([this.origin.lat, this.origin.lng], { icon: dot('#16a34a') }).addTo(this.layer); pts.push([this.origin.lat, this.origin.lng]); }
    if (this.dest) { L.marker([this.dest.lat, this.dest.lng], { icon: dot('#2563eb') }).addTo(this.layer); pts.push([this.dest.lat, this.dest.lng]); }
    if (this.driver) { L.marker([this.driver.lat, this.driver.lng], { icon: car }).addTo(this.layer); pts.push([this.driver.lat, this.driver.lng]); }

    if (this.origin && this.dest) {
      let line: L.LatLngExpression[] = [[this.origin.lat, this.origin.lng], [this.dest.lat, this.dest.lng]];
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${this.origin.lng},${this.origin.lat};${this.dest.lng},${this.dest.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        const coords = json?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
        if (coords?.length) line = coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression);
      } catch { /* sin internet o servicio caído: se dibuja la línea recta */ }
      if (id !== this.seq) return; // llegó una petición más nueva
      L.polyline(line, { color: '#3b82f6', weight: 5, opacity: 0.9 }).addTo(this.layer);
      pts.push(...line);
    }

    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [36, 36] });
    else if (pts.length === 1) map.setView(pts[0], 15);
  }
}
