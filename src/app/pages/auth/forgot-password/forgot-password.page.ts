import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonSpinner, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonItem, IonInput, IonButton, IonSpinner],
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private toast = inject(ToastController);
  private router = inject(Router);

  email = '';
  newPassword = '';
  loading = false;

  submit() {
    if (!this.email || !this.newPassword || this.loading) return;
    this.loading = true;

    this.auth.forgotPassword(this.email.trim(), this.newPassword).subscribe({
      next: async (res) => {
        this.loading = false;
        const t = await this.toast.create({ message: res.message, duration: 3500, color: 'success', position: 'top' });
        t.present();
        this.router.navigateByUrl('/login');
      },
      error: async (err: HttpErrorResponse) => {
        this.loading = false;
        const t = await this.toast.create({
          message: getErrorMessage(err),
          duration: 3500,
          color: 'danger',
          position: 'top',
        });
        t.present();
      },
    });
  }
}
