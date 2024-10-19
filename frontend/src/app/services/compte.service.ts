import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compte } from '../models/compte';

@Injectable({
  providedIn: 'root'
})
export class CompteService {
  private apiUrl = 'http://localhost:3000/api/comptes';

  constructor(private http: HttpClient) {}

  getCompteByRib(rib: string): Observable<Compte> {
    return this.http.get<Compte>(`${this.apiUrl}/details/${rib}`);
  }
  
  getComptesByClient(clientId: string): Observable<Compte []> {
    return this.http.get<Compte []>(`${this.apiUrl}/client/${clientId}`);
  }

  createCompte(compte: Compte): Observable<Compte> {
    return this.http.post<Compte>(this.apiUrl, compte);
  }

  updateCompte(rib: string, compte: Compte): Observable<Compte> {
    return this.http.put<Compte>(`${this.apiUrl}/${rib}`, compte);
  }

  deleteCompte(rib: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${rib}`);
  }
}
