import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { ProductService } from './services/product.service';
import { TicketService } from './services/ticket.service';
import { Product } from './models/product.model';
import { SaleItem } from './models/sale-item.model';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: any;
  let productService: jasmine.SpyObj<ProductService>;
  let ticketService: jasmine.SpyObj<TicketService>;

  const mockProducts: Product[] = [
    { id: 1, name: 'Mouse Óptico', unitPrice: 25000, stock: 30 },
    { id: 2, name: 'Teclado Mecánico', unitPrice: 85000, stock: 20 }
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

  it('should have the correct title', () => {
    expect(component.titulo).toEqual('POS Tienda');
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(component.form.get('product')).toBeDefined();
    expect(component.form.get('quantity')).toBeDefined();
    expect(component.form.get('unitPrice')).toBeDefined();
  });

  it('should load products on init', () => {
    component.ngOnInit();
    expect(productService.getAll$).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  });

  describe('applyFilter', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.products = mockProducts;
    });

    it('should filter products when search term exists', () => {
      component.searchTerm = 'mouse';
      productService.searchByName.and.returnValue([mockProducts[0]]);
      component.applyFilter();
      expect(productService.searchByName).toHaveBeenCalledWith('mouse');
    });

    it('should show first 8 products when search term is empty', () => {
      component.searchTerm = '';
      component.applyFilter();
      expect(component.filtered.length).toBeLessThanOrEqual(8);
    });
  });

  describe('selectProduct', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.products = mockProducts;
    });

    it('should update form when product is selected', () => {
      const product = mockProducts[0];
      component.selectProduct(product);
      expect(component.form.get('product')?.value).toBe(product.name);
      expect(component.form.get('unitPrice')?.value).toBe(product.unitPrice);
      expect(component.searchTerm).toBe(product.name);
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.products = mockProducts;
    });

    it('should not add item if form is invalid', () => {
      component.form.patchValue({ product: '', quantity: 0 });
      const initialItemsCount = component.items.length;
      component.addItem();
      expect(component.items.length).toBe(initialItemsCount);
    });

    it('should add item when form is valid', () => {
      const product = mockProducts[0];
      component.form.patchValue({
        product: product.name,
        quantity: 2,
        unitPrice: product.unitPrice
      });
      component.addItem();
      expect(component.items.length).toBe(1);
      expect(component.items[0].productId).toBe(product.id);
      expect(component.items[0].quantity).toBe(2);
    });

    it('should show error when product is not found', () => {
      component.form.patchValue({
        product: 'Producto Inexistente',
        quantity: 1,
        unitPrice: 10000
      });
      component.addItem();
      expect(component.error).toBe('Producto no encontrado');
    });

    it('should show error when stock is insufficient', () => {
      const product = mockProducts[0];
      component.form.patchValue({
        product: product.name,
        quantity: 100, // Más que el stock disponible
        unitPrice: product.unitPrice
      });
      component.addItem();
      expect(component.error).toBe('Stock insuficiente');
    });

    it('should update existing item quantity if same product and price', () => {
      const product = mockProducts[0];
      component.items = [{
        productId: product.id,
        productName: product.name,
        unitPrice: product.unitPrice,
        quantity: 1,
        subtotal: product.unitPrice
      }];
      component.form.patchValue({
        product: product.name,
        quantity: 2,
        unitPrice: product.unitPrice
      });
      component.addItem();
      expect(component.items.length).toBe(1);
      expect(component.items[0].quantity).toBe(3);
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      component.items = [
        {
          productId: 1,
          productName: 'Product 1',
          unitPrice: 10000,
          quantity: 2,
          subtotal: 20000
        },
        {
          productId: 2,
          productName: 'Product 2',
          unitPrice: 20000,
          quantity: 1,
          subtotal: 20000
        }
      ];
      component.computeTotal();
    });

    it('should remove item at specified index', () => {
      const initialCount = component.items.length;
      component.removeItem(0);
      expect(component.items.length).toBe(initialCount - 1);
      expect(component.items[0].productId).toBe(2);
    });

    it('should recalculate total after removing item', () => {
      const initialTotal = component.total;
      component.removeItem(0);
      expect(component.total).toBeLessThan(initialTotal);
    });
  });

  describe('generateTicket', () => {
    beforeEach(() => {
      component.items = [{
        productId: 1,
        productName: 'Mouse Óptico',
        unitPrice: 25000,
        quantity: 2,
        subtotal: 50000
      }];
      component.total = 50000;
      ticketService.generateTicket.and.returnValue(null);
    });

    it('should not generate ticket if items array is empty', () => {
      component.items = [];
      component.generateTicket();
      expect(ticketService.generateTicket).not.toHaveBeenCalled();
    });

    it('should generate ticket when items exist', () => {
      component.generateTicket();
      expect(ticketService.generateTicket).toHaveBeenCalledWith(component.items);
      expect(component.items.length).toBe(0);
      expect(component.total).toBe(0);
    });
  });

  describe('computeTotal', () => {
    it('should calculate total from items', () => {
      component.items = [
        { productId: 1, productName: 'Product 1', unitPrice: 10000, quantity: 2, subtotal: 20000 },
        { productId: 2, productName: 'Product 2', unitPrice: 15000, quantity: 1, subtotal: 15000 }
      ];
      component.computeTotal();
      expect(component.total).toBe(35000);
    });

    it('should return 0 when items array is empty', () => {
      component.items = [];
      component.computeTotal();
      expect(component.total).toBe(0);
    });
  });
});
