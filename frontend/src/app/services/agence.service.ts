import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agence } from 'app/models/agence';


@Injectable({
  providedIn: 'root'
})
export class AgenceService {
  private apiUrl = 'http://localhost:3000/api/admin/agences'; // Replace with your back-end URL

  constructor(private http: HttpClient) {}

  // Get all agences
  getAgences(): Observable<Agence[]> {
    return this.http.get<Agence[]>(this.apiUrl);
  }

  // Get agence by ID
  getAgenceById(id: number): Observable<Agence> {
    return this.http.get<Agence>(`${this.apiUrl}/${id}`);
  }

  // Create a new agence
  createAgence(agence: Agence): Observable<Agence> {
    return this.http.post<Agence>(this.apiUrl, agence, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // Update an existing agence
  updateAgence(id: number, agence: Agence): Observable<Agence> {
    return this.http.put<Agence>(`${this.apiUrl}/${id}`, agence, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // Delete an agence
  deleteAgence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
