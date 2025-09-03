import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EstudiantesService } from "./services/estudiantes.service";
import { Estudiante } from "./models/estudiante.model";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private fb = inject(FormBuilder);
  private estudiantesService = inject(EstudiantesService);

  titulo = 'Estudiantes';
  form!: FormGroup;
  estudiantes: Estudiante[] = [];
  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    });
    this.cargarEstudiantes();
  }

  async cargarEstudiantes() {
    this.cargando = true;
    this.error = null;
    try {
      this.estudiantes = await this.estudiantesService.getAll().toPromise() || [];
    } catch (e: any) {
      this.error = e?.message ?? 'Error al cargar estudiantes';
    } finally {
      this.cargando = false;
    }
  }

  async onSubmit() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.cargando = true;
    this.error = null;
    const payload: Partial<Estudiante> = this.form.value;
    try {
      const created = await this.estudiantesService.create(payload).toPromise();
      if (created) {
        this.form.reset();
        await this.cargarEstudiantes();
      }
    } catch (e: any) {
      this.error = e?.message ?? 'Error al crear estudiante';
    } finally {
      this.cargando = false;
    }
  }
}
