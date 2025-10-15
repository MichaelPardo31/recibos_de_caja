import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ticket } from "../models/ticket.model";
import { SaleItem } from "../models/sale-item.model";
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";

const API = `${environment.apiUrl}/tickets`;

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly tickets$ = new BehaviorSubject<Ticket[]>([]);

  constructor(private http: HttpClient) {}

  getAll$(): Observable<Ticket[]> {
    this.http.get<Ticket[]>(API).subscribe(list => this.tickets$.next(list));
    return this.tickets$.asObservable();
  }

  generateTicket(items: SaleItem[]): Ticket | null {
    // Adaptar items del front a payload del backend
    const payload = { items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) };
    let created: Ticket | null = null;
    this.http.post<Ticket>(API, payload).subscribe(t => {
      created = t;
      // refrescar lista
      this.http.get<Ticket[]>(API).subscribe(list => this.tickets$.next(list));
    });
    return created; // en ejecución real, esto es async; el componente sólo usa como side-effect
  }
}


