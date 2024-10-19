import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeCreditService {
  private apiUrl = 'http://localhost:3000/api/credit';

  constructor(private http: HttpClient) { }


  submitCreditRequest(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/demandes-credit`, formData);
  }


  getCreditByClient(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/client/${clientId}`);
  }

  getAllCredit(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }


  simulateCredit(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulateCredit`, data);
  }

  validateCredit(credit): Observable<any> {
    return this.http.post(`${this.apiUrl}/validateCredit`, credit);
  }

  getDemandesCreditDetails(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }


}