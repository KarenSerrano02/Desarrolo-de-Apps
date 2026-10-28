import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { RegisterRequest } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonInput,
    IonLabel,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
  ],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private toast = inject(ToastController);

  role: 'client' | 'driver' = 'client';
  loading = false;

  form = {
    name: '',
    email: '',
    phone: '',
    password: '',
    license_number: '',
    plate: '',
    brand: '',
    model: '',
    year: 2024,
    capacity: 4,
    color: '',
  };

  setRole(value: unknown) {
    this.role = value === 'driver' ? 'driver' : 'client';
  }

  submit() {
    if (this.loading) return;
    this.loading = true;

    const f = this.form;
    const payload: RegisterRequest = {
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      password: f.password,
      role: this.role,
    };

    if (this.role === 'driver') {
      payload.license_number = f.license_number.trim();
      payload.plate = f.plate.trim();
      payload.brand = f.brand.trim();
      payload.model = f.model.trim();
      payload.year = Number(f.year);
      payload.capacity = Number(f.capacity);
      payload.color = f.color.trim();
    }

    this.auth.register(payload).subscribe({
      next: async () => {
        this.loading = false;
        const message =
          this.role === 'driver'
            ? 'Cuenta creada. Un administrador debe aprobarte antes de recibir viajes.'
            : 'Cuenta creada.';
        const t = await this.toast.create({ message, duration: 3500, color: 'success', position: 'top' });
        t.present();
        this.auth.goToHome();
      },
      error: async (err: HttpErrorResponse) => {
        this.loading = false;
        const t = await this.toast.create({
          message: getErrorMessage(err),
          duration: 4500,
          color: 'danger',
          position: 'top',
        });
        t.present();
      },
    });
  }
}
