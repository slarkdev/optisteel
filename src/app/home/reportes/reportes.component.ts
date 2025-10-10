import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TablaComponent } from '../../shared/tabla/tabla.component';
import { ApiLotesService } from '../../services/lote.service';
import { ApiProyectosService } from '../../services/proyectos.service';
import { ReportesService } from '../../services/reportes.service'; // <- ruta según tu estructura
import { ReportesVM } from '../../models/reportes';
import { toVMList } from './reportes.adapters';
import { ColReporte } from './tabla-reportes.component';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
  standalone: false,
})
export class ReportesComponent implements OnInit, OnDestroy {
  @ViewChild('tablaRef') tabla!: TablaComponent;

  private destroy$ = new Subject<void>();

  proyectoSeleccionado: any;
  loteSeleccionado: any;
  nombreProyecto = '';
  nombreLote = '';

  reportes: ReportesVM[] = [];
  seleccionados: ReportesVM[] = [];

  // Columnas con "grupo" para que tu <app-tabla> pueda pintar encabezados agrupados si ya lo soporta
  columnasTabla: ColReporte[]  = [
    // Fijo (sin nombre)
    { header: 'Perfil',     key: 'Perfil',    tipo: 'texto',  spanClase: '', grupo: '' },
    { header: 'Calidad',    key: 'Calidad',   tipo: 'texto',  spanClase: '', grupo: '' },
    { header: 'Peso (kg)',  key: 'Peso',      tipo: 'numero', spanClase: '', grupo: '', decimals: 2 },

    // Sin empate
    { header: 'Cantidad',            key: 'Cantidad_sin',       tipo: 'numero', spanClase: '', grupo: 'Sin empate' },
    { header: 'Longitud Total (mm)', key: 'LongitudTotal_sin',  tipo: 'numero', spanClase: '', grupo: 'Sin empate' },
    { header: 'Saldo (%)',           key: 'Saldo_sin',          tipo: 'porcentaje', spanClase: '', grupo: 'Sin empate' },
    { header: 'Residuo (%)',         key: 'Residuo_sin',        tipo: 'porcentaje', spanClase: '', grupo: 'Sin empate' },
    { header: 'Desperdicio (%)',     key: 'Desperdicio_sin',    tipo: 'porcentaje', spanClase: '', grupo: 'Sin empate' },
    { header: 'Cortes',              key: 'Cortes_sin',         tipo: 'numero', spanClase: '', grupo: 'Sin empate' },

    // Con empate
    { header: 'Cantidad',            key: 'Cantidad_con',       tipo: 'numero', spanClase: '', grupo: 'Con empate' },
    { header: 'Longitud Total (mm)', key: 'LongitudTotal_con',  tipo: 'numero', spanClase: '', grupo: 'Con empate' },
    { header: 'Saldo (%)',           key: 'Saldo_con',          tipo: 'porcentaje', spanClase: '', grupo: 'Con empate' },
    { header: 'Residuo (%)',         key: 'Residuo_con',        tipo: 'porcentaje', spanClase: '', grupo: 'Con empate' },
    { header: 'Desperdicio (%)',     key: 'Desperdicio_con',    tipo: 'porcentaje', spanClase: '', grupo: 'Con empate' },
    { header: 'Cortes',              key: 'Cortes_con',         tipo: 'numero', spanClase: '', grupo: 'Con empate' },
  ];

  constructor(
    private apiLotesService: ApiLotesService,
    private apiProyectosService: ApiProyectosService,
    private reportesService: ReportesService,
    private sb: MatSnackBar
  ) {}

  get workId(): string {
    return this.loteSeleccionado?._id;
  }

  ngOnInit(): void {
    this.apiProyectosService
      .getProyectoSeleccionado()
      .pipe(takeUntil(this.destroy$))
      .subscribe((proyecto) => {
        this.proyectoSeleccionado = proyecto;
        this.nombreProyecto = proyecto?.name ?? '';
      });

    this.apiLotesService
      .getLoteSeleccionado()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((lote) => {
          this.loteSeleccionado = lote;
          this.nombreLote = lote?.NombreTrabajo ?? '';
          if (!this.workId) return [];
          return this.reportesService.list(this.workId);
        }),
        switchMap(() => this.reportesService.getPorTrabajoID(this.workId))
      )
      .subscribe({
        next: (rows) => {
          this.reportes = toVMList(rows);
        },
        error: (err) => {
          console.error('Error cargando reportes:', err);
          this.sb.open('Error al cargar reportes', 'Cerrar', { duration: 3000 });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refrescar(): void {
    if (!this.workId) return;
    this.reportesService.list(this.workId).subscribe({
      next: () => this.sb.open('Reportes actualizados', 'Cerrar', { duration: 2000 }),
      error: () => this.sb.open('Error al refrescar', 'Cerrar', { duration: 3000 }),
    });
    if (this.tabla) this.tabla.filtro = '';
  }

  exportar(): void {
    // Placeholder: luego conectamos a tu endpoint de exportación
    this.sb.open('Exportando…', 'Cerrar', { duration: 2000 });
  }

  borrarSeleccion(): void {
    // Placeholder local (hasta que definamos endpoint)
    if (!this.seleccionados.length) return;
    const ids = new Set(this.seleccionados.map((r) => r._id));
    this.reportes = this.reportes.filter((r) => !ids.has(r._id));
    this.seleccionados = [];
    if (this.tabla) this.tabla.filtro = '';
    this.sb.open('Selección eliminada (local)', 'Cerrar', { duration: 2000 });
  }

  actualizarSeleccionados(sel: ReportesVM[]): void {
    this.seleccionados = sel;
  }

  clickRow(row: ReportesVM): void {
    // Abre detalle/descarga PDF si procede
    console.log('Fila reporte:', row);
  }
}
