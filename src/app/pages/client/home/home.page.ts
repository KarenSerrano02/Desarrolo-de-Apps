import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RideService } from '../../../core/services/ride.service';
import { PAYMENT_METHODS, Point, getCurrentPosition, paymentLabel, reverseName, searchPlaces } from '../../../core/data/places';
import { getErrorMessage } from '../../../core/utils/http-error';
import { STATUS_LABEL, cop } from '../../../core/utils/format';
import { RouteMapComponent } from '../../../shared/route-map.component';

type Field = 'origin' | 'dest';

@Component({
  selector: 'app-client-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSpinner, RouteMapComponent],
})
export class HomePage implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(RideService);
  private toast = inject(ToastController);

  user = this.auth.getUser();
  cop = cop;
  label = STATUS_LABEL;
  methods = PAYMENT_METHODS;
  payLabel = paymentLabel;

  tab = signal<'viaje' | 'historial'>('viaje');
  loading = signal(true);
  busy = signal(false);
  active = signal<any>(null); // { type, data }
  estimate = signal<any>(null);
  fare = signal<any>(null);
  trips = signal<any[]>([]);

  origin: Point | null = null;
  dest: Point | null = null;
  field: Field = 'origin';
  query: Record<Field, string> = { origin: '', dest: '' };
  results = signal<Point[]>([]);
  payment = 'cash';
  private searchTimer: any;

  // calificación
  ratingTripId: number | null = null;
  score = 5;
  comment = '';
  incident = false;
  private lastTripId: number | null = null;
  private timer: any;

  ngOnInit() {
    try { this.payment = localStorage.getItem('uber_payment') || 'cash'; } catch {}
    this.api.activeFare().subscribe({ next: (r) => this.fare.set(r.fare), error: () => {} });
    this.refresh();
    this.timer = setInterval(() => this.refresh(true), 5000);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
    clearTimeout(this.searchTimer);
  }

  private async say(message: string, color = 'danger') {
    (await this.toast.create({ message, duration: 3000, color, position: 'top' })).present();
  }
  private fail = (e: HttpErrorResponse) => {
    this.busy.set(false);
    this.say(getErrorMessage(e));
  };

  refresh(silent = false) {
    this.api.clientActive().subscribe({
      next: (r) => {
        this.loading.set(false);
        if (r.has_active) {
          this.active.set(r);
          if (r.type === 'trip') this.lastTripId = r.data.id;
        } else {
          if (this.active()?.type === 'trip' && this.lastTripId) this.ratingTripId = this.lastTripId;
          this.active.set(null);
        }
      },
      error: (e) => {
        this.loading.set(false);
        if (!silent) this.say(getErrorMessage(e));
      },
    });
  }

  // ---------- origen / destino ----------
  focusField(f: Field) {
    this.field = f;
    this.results.set([]);
  }

  onType(f: Field) {
    this.field = f;
    clearTimeout(this.searchTimer);
    const q = this.query[f].trim();
    if (q.length < 3) return this.results.set([]);
    this.searchTimer = setTimeout(async () => {
      try { this.results.set(await searchPlaces(q)); } catch { this.results.set([]); }
    }, 500);
  }

  choose(p: Point) {
    this.setPoint(this.field, p);
    this.results.set([]);
  }

  async onMapPick(c: { lat: number; lng: number }) {
    const f = this.field;
    this.setPoint(f, { name: 'Punto en el mapa', ...c });
    const name = await reverseName(c.lat, c.lng);
    this.setPoint(f, { name, ...c });
  }

  async useGps() {
    try {
      const c = await getCurrentPosition();
      this.setPoint('origin', { name: 'Mi ubicación', ...c });
      this.field = 'dest';
    } catch {
      this.say('No se pudo obtener tu ubicación. Búscala o tócala en el mapa.');
    }
  }

  private setPoint(f: Field, p: Point) {
    if (f === 'origin') this.origin = p; else this.dest = p;
    this.query[f] = p.name;
    if (f === 'origin' && !this.dest) this.field = 'dest';
    this.calc();
  }

  swap() {
    [this.origin, this.dest] = [this.dest, this.origin];
    [this.query.origin, this.query.dest] = [this.query.dest, this.query.origin];
    this.calc();
  }

  calc() {
    this.estimate.set(null);
    const o = this.origin, d = this.dest;
    if (!o || !d) return;
    this.api
      .estimate({ origin_latitude: o.lat, origin_longitude: o.lng, destination_latitude: d.lat, destination_longitude: d.lng })
      .subscribe({ next: (r) => this.estimate.set(r.estimate), error: this.fail });
  }

  /** Desglose a partir de la tarifa activa (el total lo calcula el backend). */
  breakdown() {
    const e = this.estimate();
    const b = e?.fare_breakdown ?? this.fare();
    if (!e || !b) return null;
    const base = Number(b.base_fare), km = Number(b.price_per_km) * Number(e.distance_km), min = Number(b.price_per_minute) * Number(e.duration_min);
    return { base, km, min, surge: Number(b.surge_multiplier ?? 1), minimum: Number(b.minimum_fare), raw: base + km + min };
  }

  setPayment(id: string) {
    this.payment = id;
    try { localStorage.setItem('uber_payment', id); } catch {}
  }

  request() {
    const o = this.origin, d = this.dest;
    if (!o || !d || this.busy()) return;
    this.busy.set(true);
    this.api
      .request({
        origin_name: o.name, origin_latitude: o.lat, origin_longitude: o.lng,
        destination_name: d.name, destination_latitude: d.lat, destination_longitude: d.lng,
        payment_method: this.payment,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.estimate.set(null);
          this.refresh();
        },
        error: this.fail,
      });
  }

  // ---------- viaje activo ----------
  activeOrigin() { const a = this.active()?.data; return a?.origin_latitude != null ? { lat: +a.origin_latitude, lng: +a.origin_longitude } : this.origin; }
  activeDest() { const a = this.active()?.data; return a?.destination_latitude != null ? { lat: +a.destination_latitude, lng: +a.destination_longitude } : this.dest; }
  driverPos() { const l = this.active()?.data?.driver?.latest_location; return l ? { lat: +l.latitude, lng: +l.longitude } : null; }

  cancel() {
    const a = this.active();
    if (!a || this.busy()) return;
    // Para un viaje asignado se cancela por el id de la solicitud original.
    const id = a.type === 'trip' ? (a.data.request_id ?? a.data.id) : a.data.id;
    this.busy.set(true);
    this.api.cancel(id, 'Cancelado por el pasajero').subscribe({
      next: () => {
        this.busy.set(false);
        this.lastTripId = null;
        this.active.set(null);
        this.say('Solicitud cancelada', 'success');
      },
      error: this.fail,
    });
  }

  sendRating() {
    if (!this.ratingTripId || this.busy()) return;
    this.busy.set(true);
    this.api.rate(this.ratingTripId, this.score, this.comment, this.incident).subscribe({
      next: () => {
        this.busy.set(false);
        this.ratingTripId = null;
        this.lastTripId = null;
        this.comment = '';
        this.say('¡Gracias por tu calificación!', 'success');
      },
      error: this.fail,
    });
  }
  skipRating() {
    this.ratingTripId = null;
    this.lastTripId = null;
  }

  setTab(t: 'viaje' | 'historial') {
    this.tab.set(t);
    if (t === 'historial') this.loadTrips();
  }
  loadTrips() {
    this.api.clientTrips().subscribe({ next: (r) => this.trips.set(r.trips?.data ?? r.trips ?? []), error: this.fail });
  }
  rateOld(id: number) {
    this.ratingTripId = id;
    this.tab.set('viaje');
  }
}
