import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { Ticket } from '../models/ticket.model';
import { environment } from '../../environments/environment';
import { skip } from 'rxjs';

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

  it('should fetch all tickets', (done) => {
    const mockTickets: Ticket[] = [
      {
        id: '1',
        createdAt: '2024-01-01T10:00:00Z',
        items: [],
        total: 50000
      }
    ];

    service.getAll$().pipe(skip(1)).subscribe(tickets => {
      expect(tickets).toEqual(mockTickets);
      done();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTickets);
  });
});
