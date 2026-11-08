import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RideService } from '../../../core/services/ride.service';
import { getErrorMessage } from '../../../core/utils/http-error';
import { STATUS_LABEL, cop } from '../../../core/utils/format';

const TRIP_KEY = 'uber_driver_trip';

@Component({
  selector: 'app-driver-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSpinner],
})
export class HomePage implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private api = inject(RideService);
  private toast = inject(ToastController);

  cop = cop;
  label = STATUS_LABEL;
  user = this.auth.getUser();

  online = signal(false);
  busy = signal(false);
  requests = signal<any[]>([]);
  trip = signal<any>(null); // viaje en curso (guardado localmente)
  km = 0;
  min = 0;

  private poll: any;
  private locTimer: any;

  ngOnInit() {
    try {
      const raw = localStorage.getItem(TRIP_KEY);
      if (raw) this.setTrip(JSON.parse(raw));
    } catch {}
    this.poll = setInterval(() => this.loadRequests(), 5000);
  }
  ngOnDestroy() {
    clearInterval(this.poll);
    clearInterval(this.locTimer);
  }

  private async say(message: string, color = 'danger') {
    (await this.toast.create({ message, duration: 3000, color, position: 'top' })).present();
  }
  private fail = (e: HttpErrorResponse) => {
    this.busy.set(false);
    this.say(getErrorMessage(e));
  };

  private setTrip(t: any | null) {
    this.trip.set(t);
    try {
      t ? localStorage.setItem(TRIP_KEY, JSON.stringify(t)) : localStorage.removeItem(TRIP_KEY);
    } catch {}
    if (t) {
      this.km = Number(t.estimated_distance_km ?? 0);
      this.min = Number(t.estimated_duration_min ?? 0);
    }
  }

  toggle() {
    if (this.busy()) return;
    const next = this.online() ? 'unavailable' : 'available';
    this.busy.set(true);
    this.api.setAvailability(next).subscribe({
      next: () => {
        this.busy.set(false);
        this.online.set(next === 'available');
        this.online() ? this.startLocation() : clearInterval(this.locTimer);
        this.loadRequests();
      },
      error: this.fail,
    });
  }

  private startLocation() {
    clearInterval(this.locTimer);
    const send = () => {
      navigator.geolocation?.getCurrentPosition(
        (p) => this.api.sendLocation(p.coords.latitude, p.coords.longitude, this.trip()?.id).subscribe({ error: () => {} }),
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };
    send();
    this.locTimer = setInterval(send, 10000);
  }

  loadRequests() {
    if (!this.online() || this.trip()) return;
    this.api.driverRequests().subscribe({ next: (r) => this.requests.set(r.requests ?? []), error: () => {} });
  }

  accept(req: any) {
    if (this.busy()) return;
    this.busy.set(true);
    this.api.accept(req.id).subscribe({
      next: (r) => {
        this.busy.set(false);
        this.setTrip({ ...r.trip, estimated_distance_km: req.estimated_distance_km, estimated_duration_min: req.estimated_duration_min, origin_name: req.origin_name, destination_name: req.destination_name, client: req.client });
        this.requests.set([]);
      },
      error: (e: HttpErrorResponse) => {
        this.fail(e);
        this.loadRequests(); // 409: otro conductor lo tomó
      },
    });
  }

  step(action: 'arrive' | 'start' | 'complete') {
    const t = this.trip();
    if (!t || this.busy()) return;
    this.busy.set(true);
    const call =
      action === 'arrive' ? this.api.arrive(t.id) : action === 'start' ? this.api.start(t.id) : this.api.complete(t.id, this.km, this.min);
    call.subscribe({
      next: (r) => {
        this.busy.set(false);
        if (action === 'complete') {
          this.say(`Viaje finalizado: ${cop(r.trip?.final_fare)}`, 'success');
          this.setTrip(null);
          this.loadRequests();
        } else {
          this.setTrip({ ...t, ...r.trip });
        }
      },
      error: this.fail,
    });
  }
}
