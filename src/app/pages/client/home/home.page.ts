import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RideService } from '../../../core/services/ride.service';
import { PLACES, Place, getCurrentPosition } from '../../../core/data/places';
import { getErrorMessage } from '../../../core/utils/http-error';
import { STATUS_LABEL, cop } from '../../../core/utils/format';

@Component({
  selector: 'app-client-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSpinner],
})
export class HomePage implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(RideService);
  private toast = inject(ToastController);

  user = this.auth.getUser();
  places: Place[] = PLACES;
  cop = cop;
  label = STATUS_LABEL;

  tab = signal<'viaje' | 'historial'>('viaje');
  loading = signal(true);
  busy = signal(false);
  active = signal<any>(null); // { type, data }
  estimate = signal<any>(null);
  trips = signal<any[]>([]);

  originIdx = '';
  destIdx = '';
  gps: { lat: number; lng: number } | null = null;

  // calificación
  ratingTripId: number | null = null;
  score = 5;
  comment = '';
  incident = false;
  private lastTripId: number | null = null;
  private timer: any;

  ngOnInit() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(true), 5000);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
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

  async useGps() {
    try {
      this.gps = await getCurrentPosition();
      this.originIdx = 'gps';
      this.calc();
    } catch {
      this.say('No se pudo obtener tu ubicación. Elige un lugar de la lista.');
    }
  }

  private point(idx: string): { name: string; lat: number; lng: number } | null {
    if (idx === 'gps' && this.gps) return { name: 'Mi ubicación', ...this.gps };
    const p = this.places[Number(idx)];
    return idx !== '' && p ? p : null;
  }

  calc() {
    const o = this.point(this.originIdx),
      d = this.point(this.destIdx);
    this.estimate.set(null);
    if (!o || !d) return;
    this.api
      .estimate({ origin_latitude: o.lat, origin_longitude: o.lng, destination_latitude: d.lat, destination_longitude: d.lng })
      .subscribe({ next: (r) => this.estimate.set(r.estimate), error: this.fail });
  }

  request() {
    const o = this.point(this.originIdx),
      d = this.point(this.destIdx);
    if (!o || !d || this.busy()) return;
    this.busy.set(true);
    this.api
      .request({
        origin_name: o.name, origin_latitude: o.lat, origin_longitude: o.lng,
        destination_name: d.name, destination_latitude: d.lat, destination_longitude: d.lng,
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
