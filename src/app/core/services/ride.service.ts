import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Coords { origin_latitude: number; origin_longitude: number; destination_latitude: number; destination_longitude: number; }

@Injectable({ providedIn: 'root' })
export class RideService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // ---- Cliente ----
  activeFare() { return this.http.get<any>(`${this.api}/fares/active`); }
  estimate(c: Coords) { return this.http.post<any>(`${this.api}/client/estimate-fare`, c); }
  request(body: Coords & { origin_name: string; destination_name: string }) {
    return this.http.post<any>(`${this.api}/client/ride-requests`, body);
  }
  clientActive() { return this.http.get<any>(`${this.api}/client/active`); }
  cancel(id: number, reason: string) { return this.http.post<any>(`${this.api}/client/cancel/${id}`, { reason }); }
  clientTrips() { return this.http.get<any>(`${this.api}/client/trips`); }
  rate(tripId: number, score: number, comment: string, has_incident: boolean) {
    return this.http.post<any>(`${this.api}/client/trips/${tripId}/rating`, { score, comment, has_incident });
  }

  // ---- Conductor ----
  setAvailability(status: 'available' | 'unavailable') {
    return this.http.put<any>(`${this.api}/driver/availability`, { status });
  }
  driverRequests() { return this.http.get<any>(`${this.api}/driver/ride-requests`); }
  accept(id: number) { return this.http.post<any>(`${this.api}/driver/ride-requests/${id}/accept`, {}); }
  arrive(id: number) { return this.http.post<any>(`${this.api}/driver/trips/${id}/arrive`, {}); }
  start(id: number) { return this.http.post<any>(`${this.api}/driver/trips/${id}/start`, {}); }
  complete(id: number, actual_distance_km: number, actual_duration_min: number) {
    return this.http.post<any>(`${this.api}/driver/trips/${id}/complete`, { actual_distance_km, actual_duration_min });
  }
  sendLocation(latitude: number, longitude: number, trip_id?: number) {
    return this.http.post<any>(`${this.api}/driver/location`, { latitude, longitude, trip_id });
  }

  // ---- Admin ----
  dashboard() { return this.http.get<any>(`${this.api}/admin/dashboard`); }
  drivers(status?: string) {
    return this.http.get<any>(`${this.api}/admin/drivers`, { params: status ? { approval_status: status } : {} });
  }
  approve(id: number, approval_status: string, admin_notes: string) {
    return this.http.patch<any>(`${this.api}/admin/drivers/${id}/approval`, { approval_status, admin_notes });
  }
  fares() { return this.http.get<any>(`${this.api}/admin/fares`); }
  createFare(body: any) { return this.http.post<any>(`${this.api}/admin/fares`, body); }
  adminTrips() { return this.http.get<any>(`${this.api}/admin/trips`); }
  reports() { return this.http.get<any>(`${this.api}/admin/reports`); }
  auditLogs() { return this.http.get<any>(`${this.api}/admin/audit-logs`); }
}
