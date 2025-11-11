import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll$', () => {
    it('should fetch all products and update the observable', (done) => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Mouse Óptico', unitPrice: 25000, stock: 30 },
        { id: 2, name: 'Teclado Mecánico', unitPrice: 85000, stock: 20 }
      ];

      service.getAll$().subscribe(products => {
        expect(products).toEqual(mockProducts);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should return empty array if API returns empty', (done) => {
      service.getAll$().subscribe(products => {
        expect(products).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });

  describe('searchByName', () => {
    beforeEach(() => {
      // Primero necesitamos cargar productos
      const mockProducts: Product[] = [
        { id: 1, name: 'Mouse Óptico', unitPrice: 25000, stock: 30 },
        { id: 2, name: 'Teclado Mecánico', unitPrice: 85000, stock: 20 },
        { id: 3, name: 'Monitor 24"', unitPrice: 450000, stock: 10 }
      ];

      service.getAll$().subscribe();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockProducts);
    });

    it('should return first 8 products when search term is empty', () => {
      const result = service.searchByName('');
      expect(result.length).toBeLessThanOrEqual(8);
    });

    it('should return first 8 products when search term is whitespace', () => {
      const result = service.searchByName('   ');
      expect(result.length).toBeLessThanOrEqual(8);
    });

    it('should filter products by name (case insensitive)', () => {
      const result = service.searchByName('mouse');
      expect(result.length).toBe(1);
      expect(result[0].name).toContain('Mouse');
    });

    it('should filter products by name (uppercase search)', () => {
      const result = service.searchByName('TECLADO');
      expect(result.length).toBe(1);
      expect(result[0].name).toContain('Teclado');
    });

    it('should return empty array when no products match', () => {
      const result = service.searchByName('xyz123');
      expect(result).toEqual([]);
    });

    it('should return multiple products when search matches multiple', () => {
      const result = service.searchByName('o');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(product => {
        expect(product.name.toLowerCase()).toContain('o');
      });
    });
  });
});

