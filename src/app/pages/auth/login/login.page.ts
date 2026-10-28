import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/utils/http-error';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonSpinner],
})
export class LoginPage {
  private auth = inject(AuthService);
  private toast = inject(ToastController);

  login = '';
  password = '';
  loading = false;

  submit() {
    if (!this.login || !this.password || this.loading) return;
    this.loading = true;

    this.auth.login({ login: this.login.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.auth.goToHome();
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
