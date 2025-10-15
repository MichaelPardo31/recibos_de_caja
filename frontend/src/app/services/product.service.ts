import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { Product } from "../models/product.model";

const API = `${environment.apiUrl}/products`;

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly products$ = new BehaviorSubject<Product[]>([]);

  constructor(private http: HttpClient) {}

  getAll$(): Observable<Product[]> {
    this.http.get<Product[]>(API).subscribe(list => this.products$.next(list));
    return this.products$.asObservable();
  }

  searchByName(term: string): Product[] {
    const t = term.trim();
    if (!t) return this.products$.getValue().slice(0, 8);
    // búsqueda local rápida; opcionalmente podríamos llamar a ?q=
    return this.products$.getValue().filter(p => p.name.toLowerCase().includes(t.toLowerCase()));
  }
}


