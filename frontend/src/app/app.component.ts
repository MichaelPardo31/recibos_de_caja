import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from "./services/product.service";
import { TicketService } from "./services/ticket.service";
import { Product } from "./models/product.model";
import { SaleItem } from "./models/sale-item.model";
import jsPDF from 'jspdf';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private ticketService = inject(TicketService);

  titulo = 'POS Tienda';
  form!: FormGroup;
  // Inventario y búsqueda
  products: Product[] = [];
  searchTerm = '';
  filtered: Product[] = [];
  // Ticket en edición
  items: SaleItem[] = [];
  total = 0;
  // Estado UI
  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      product: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
    this.productService.getAll$().subscribe((list: Product[]) => {
      this.products = list;
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filtered = this.searchTerm
      ? this.productService.searchByName(this.searchTerm)
      : this.products.slice(0, 8);
  }

  selectProduct(p: Product) {
    this.form.patchValue({ product: p.name, unitPrice: p.unitPrice });
    this.searchTerm = p.name;
    this.applyFilter();
  }

  addItem() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const name: string = this.form.value.product;
    const quantity: number = Number(this.form.value.quantity) || 1;
    const unitPrice: number = Number(this.form.value.unitPrice) || 0;
    const product = this.products.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!product) { this.error = 'Producto no encontrado'; return; }
    if (product.stock < quantity) { this.error = 'Stock insuficiente'; return; }

    const existing = this.items.find(i => i.productId === product.id && i.unitPrice === unitPrice);
    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (product.stock < nextQty) { this.error = 'Stock insuficiente'; return; }
      existing.quantity = nextQty;
      existing.subtotal = Number((existing.quantity * existing.unitPrice).toFixed(2));
    } else {
      this.items.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity,
        subtotal: Number((quantity * unitPrice).toFixed(2))
      });
    }
    this.computeTotal();
    this.form.patchValue({ quantity: 1 });
    this.error = null;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.computeTotal();
  }

  generateTicket() {
    if (!this.items.length) return;
    try {
      this.ticketService.generateTicket(this.items);
      this.generatePDF();
      this.items = [];
      this.total = 0;
      this.form.reset({ quantity: 1, unitPrice: 0, product: '' });
      this.error = null;
      alert('Ticket generado y PDF descargado');
    } catch (e: any) {
      this.error = e?.message ?? 'Error al generar ticket';
    }
  }

  private generatePDF() {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO');
    const timeStr = now.toLocaleTimeString('es-CO');

    // Header
    doc.setFontSize(20);
    doc.text('TIENDA TECNOLÓGICA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('RECIBO DE CAJA', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Fecha: ${dateStr}`, 20, 45);
    doc.text(`Hora: ${timeStr}`, 20, 52);
    doc.text(`Ticket #${Date.now()}`, 20, 59);

    // Items table
    let y = 75;
    doc.setFontSize(12);
    doc.text('PRODUCTO', 20, y);
    doc.text('CANT', 120, y);
    doc.text('PRECIO', 140, y);
    doc.text('SUBTOTAL', 160, y);
    
    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(10);
    for (const item of this.items) {
      doc.text(item.productName.substring(0, 25), 20, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(`$${item.unitPrice.toFixed(0)}`, 140, y);
      doc.text(`$${item.subtotal.toFixed(0)}`, 160, y);
      y += 8;
    }

    // Total
    y += 10;
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: $${this.total.toFixed(0)}`, 20, y);

    // Footer
    y += 20;
    doc.setFontSize(8);
    doc.text('¡Gracias por su compra!', 105, y, { align: 'center' });
    doc.text('Vuelva pronto', 105, y + 8, { align: 'center' });

    // Download
    doc.save(`ticket_${Date.now()}.pdf`);
  }

  private computeTotal() {
    this.total = Number(this.items.reduce((a, b) => a + b.subtotal, 0).toFixed(2));
  }
}
