import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RideService } from '../../../core/services/ride.service';
import { getErrorMessage } from '../../../core/utils/http-error';
import { STATUS_LABEL, cop } from '../../../core/utils/format';

type Tab = 'resumen' | 'conductores' | 'tarifas' | 'viajes';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSpinner],
})
export class DashboardPage implements OnInit {
  auth = inject(AuthService);
  private api = inject(RideService);
  private toast = inject(ToastController);

  cop = cop;
  label = STATUS_LABEL;
  tab = signal<Tab>('resumen');
  loading = signal(true);
  stats = signal<any>(null);
  drivers = signal<any[]>([]);
  fares = signal<any[]>([]);
  trips = signal<any[]>([]);
  filter = '';

  newFare = { name: '', base_fare: 3800, price_per_km: 1250, price_per_minute: 250, minimum_fare: 6500, surge_multiplier: 1, active: true };

  ngOnInit() {
    this.setTab('resumen');
  }

  private async say(message: string, color = 'danger') {
    (await this.toast.create({ message, duration: 3000, color, position: 'top' })).present();
  }
  private fail = (e: HttpErrorResponse) => {
    this.loading.set(false);
    this.say(getErrorMessage(e));
  };

  setTab(t: Tab) {
    this.tab.set(t);
    this.loading.set(true);
    const done = () => this.loading.set(false);
    if (t === 'resumen') this.api.dashboard().subscribe({ next: (r) => { this.stats.set(r.stats); done(); }, error: this.fail });
    if (t === 'conductores') this.loadDrivers();
    if (t === 'tarifas') this.api.fares().subscribe({ next: (r) => { this.fares.set(r.fares?.data ?? r.fares ?? []); done(); }, error: this.fail });
    if (t === 'viajes') this.api.adminTrips().subscribe({ next: (r) => { this.trips.set(r.trips?.data ?? r.trips ?? []); done(); }, error: this.fail });
  }

  loadDrivers() {
    this.loading.set(true);
    this.api.drivers(this.filter || undefined).subscribe({
      next: (r) => { this.drivers.set(r.drivers?.data ?? r.drivers ?? []); this.loading.set(false); },
      error: this.fail,
    });
  }

  decide(d: any, status: 'approved' | 'rejected' | 'suspended') {
    this.api.approve(d.id, status, '').subscribe({
      next: () => { this.say('Conductor actualizado', 'success'); this.loadDrivers(); },
      error: this.fail,
    });
  }

  saveFare() {
    if (!this.newFare.name.trim()) return;
    this.api.createFare(this.newFare).subscribe({
      next: () => { this.say('Tarifa creada', 'success'); this.newFare.name = ''; this.setTab('tarifas'); },
      error: this.fail,
    });
  }

  badge(s: string) {
    return s === 'approved' || s === 'completed' ? 'ok' : s === 'pending' ? 'warn' : s === 'rejected' || s === 'suspended' || s === 'cancelled' ? 'bad' : '';
  }
}
