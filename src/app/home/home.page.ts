import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton
} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  // Pasamos todos los componentes a la lista de imports de Angular
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton
  ],
})
export class HomePage {
  pantalla: string = '0';

  constructor() {}

  agregar(valor: string) {
    if (this.pantalla === '0' || this.pantalla === 'Error') {
      this.pantalla = valor;
    } else {
      this.pantalla += valor;
    }
  }

  limpiar() {
    this.pantalla = '0';
  }

  calcular() {
    try {
      let expresion = this.pantalla.replace(/×/g, '*').replace(/÷/g, '/');
      let resultado = new Function('return ' + expresion)();
      this.pantalla = resultado.toString();
    } catch (e) {
      this.pantalla = 'Error';
    }
  }
}







