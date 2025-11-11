import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { Ticket } from '../models/ticket.model';
import { SaleItem } from '../models/sale-item.model';
import { environment } from '../../environments/environment';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tickets`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TicketService]
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll$', () => {
    it('should fetch all tickets and update the observable', (done) => {
      const mockTickets: Ticket[] = [
        {
          id: '1',
          createdAt: '2024-01-01T10:00:00Z',
          items: [],
          total: 50000
        }
      ];

      service.getAll$().subscribe(tickets => {
        expect(tickets).toEqual(mockTickets);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTickets);
    });

    it('should return empty array if API returns empty', (done) => {
      service.getAll$().subscribe(tickets => {
        expect(tickets).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });

  describe('generateTicket', () => {
    it('should create a ticket and refresh the list', () => {
      const items: SaleItem[] = [
        {
          productId: 1,
          productName: 'Mouse Óptico',
          unitPrice: 25000,
          quantity: 2,
          subtotal: 50000
        }
      ];

      const mockTicket: Ticket = {
        id: '1',
        createdAt: '2024-01-01T10:00:00Z',
        items: items,
        total: 50000
      };

      const result = service.generateTicket(items);

      // Primera request: POST para crear el ticket
      const createReq = httpMock.expectOne(apiUrl);
      expect(createReq.request.method).toBe('POST');
      expect(createReq.request.body).toEqual({
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      });
      createReq.flush(mockTicket);

      // Segunda request: GET para refrescar la lista
      const refreshReq = httpMock.expectOne(apiUrl);
      expect(refreshReq.request.method).toBe('GET');
      refreshReq.flush([mockTicket]);

      // Nota: El método retorna null porque es síncrono, pero el efecto secundario ocurre
      expect(result).toBeNull();
    });

    it('should handle empty items array', () => {
      const result = service.generateTicket([]);

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ items: [] });
      req.flush({ id: '1', items: [], total: 0 });

      // También debe hacer GET para refrescar
      const refreshReq = httpMock.expectOne(apiUrl);
      refreshReq.flush([]);
    });

    it('should handle multiple items', () => {
      const items: SaleItem[] = [
        {
          productId: 1,
          productName: 'Mouse Óptico',
          unitPrice: 25000,
          quantity: 2,
          subtotal: 50000
        },
        {
          productId: 2,
          productName: 'Teclado',
          unitPrice: 85000,
          quantity: 1,
          subtotal: 85000
        }
      ];

      service.generateTicket(items);

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body.items.length).toBe(2);
      req.flush({
        id: '1',
        items: items,
        total: 135000
      });

      const refreshReq = httpMock.expectOne(apiUrl);
      refreshReq.flush([]);
    });
  });
});

