import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { ProductService } from './services/product.service';
import { TicketService } from './services/ticket.service';
import { Product } from './models/product.model';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: any;
  let productService: jasmine.SpyObj<ProductService>;
  let ticketService: jasmine.SpyObj<TicketService>;

  const mockProducts: Product[] = [
    { id: 1, name: 'Mouse Óptico', unitPrice: 25000, stock: 30 }
  ];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getAll$', 'searchByName']);
    const ticketServiceSpy = jasmine.createSpyObj('TicketService', ['generateTicket']);

    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: TicketService, useValue: ticketServiceSpy }
      ]
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    ticketService = TestBed.inject(TicketService) as jasmine.SpyObj<TicketService>;

    productService.getAll$.and.returnValue(of(mockProducts));
    productService.searchByName.and.returnValue(mockProducts);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(component.form.get('product')).toBeDefined();
  });

  it('should load products on init', () => {
    component.ngOnInit();
    expect(productService.getAll$).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  });
});
