import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FareService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getActiveFare(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fares/active`);
  }

  estimateFare(originLat: number, originLng: number, destLat: number, destLng: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      origin_latitude: originLat,
      origin_longitude: originLng,
      destination_latitude: destLat,
      destination_longitude: destLng
    };

    return this.http.post(`${this.apiUrl}/client/estimate-fare`, body, { headers });
  }
}
