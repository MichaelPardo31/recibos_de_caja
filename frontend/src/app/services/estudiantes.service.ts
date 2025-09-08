import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudiante } from "../models/estudiante.model";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class EstudiantesService {
  // Thanks to proxy.conf.json, calls to "/api" go to http://localhost:8080
  private readonly base = `${environment.apiUrl}/estudiantes`;

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.base);
  }

  create(payload: Partial<Estudiante>): Observable<Estudiante> {
    return this.http.post<Estudiante>(this.base, payload);
  }
}
