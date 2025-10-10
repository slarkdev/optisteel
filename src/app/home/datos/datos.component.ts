import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiAuthService } from '../../services/apiauth.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  switchMap,
  take,
  takeUntil,
  lastValueFrom,
  tap,
} from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { Usuario } from '../../models/usuario';
import { Lote } from '../../models/lote';
import Swal from 'sweetalert2';
import { TablaComponent } from '../../shared/tabla/tabla.component';
import { ApiLotesService } from '../../services/lote.service';
import { ApiProyectosService } from '../../services/proyectos.service';
import { Proyecto } from '../../models/proyecto';
import { Datos } from '../../models/datos';
import { InventarioService } from '../../services/inventario.service';
import { Error } from '../../shared/error';
import { DatosService } from '../../services/datos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { DatosVM, toAPI, toVM } from './datos.adapters';


@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrl: './datos.component.scss',
  standalone: false,
})
export class DatosComponent implements OnInit, OnDestroy {
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;
  
  proyectoSeleccionado: any;
  loteSeleccionado: any;
  private saveTimers = new Map<number, any>();
  subscription = new Subject<void>();
  state = {
    proyecto: 'OPTISTEEL — Producción 2025',
    lote: '67891bc85f0d85bddfcb6abc',
  };

  nombreLote: string = '';
  nombreProyecto: string = '';

  onStateChanged() {}
  get workId() {
    return this.loteSeleccionado?._id;
  }

  displayedColumns: string[] = [
    'select',
    'name',
    'createdAt',
    'updatedAt',
    'createdBy',
    'piezas_count',
    'cubiertos_count',
    'no_cubiertos_count',
    'actions',
  ];
  seleccionados: any[] = []; // te devuelve todos los LOTES que hayan sido seleccionados usando el checkbox

  columnasTabla = [
    {
      header: 'Referencia',
      key: 'Referencia',
      tipo: 'texto',
      spanClase: '',
    },
    {
      header: 'Orden de producción',
      key: 'OrdenProduccion',
      tipo: 'texto',
      spanClase: '',
    },
    {
      header: 'Pieza',
      key: 'Archivo',
      tipo: 'texto',
      spanClase: '',
    },
    {
      header: 'Perfil',
      key: 'Formato',
      tipo: 'texto',
      spanClase: ''
    },
    {
      header: 'Formato',
      key: 'Perfil',
      tipo: 'texto',
      spanClase: '',
    },
    {
      header: 'Material',
      key: 'Material',
      tipo: 'texto',
      spanClase: '',
    },
    {
      header: 'Longitud (mm)',
      key: 'Longitud',
      tipo: 'numero',
      spanClase: '',
    },
    {
      header: 'Peso (kg)',
      key: 'Peso',
      tipo: 'numero',
      spanClase: '',
    },
    {
      header: 'Cantidad',
      key: 'Cantidad',
      tipo: 'numero',
      spanClase: '',
    },
    {
      header: 'Cubierto',
      key: 'Cubierto',
      tipo: 'Cubierto',
      spanClase: '',
    },
    {
      header: 'Origen',
      key: 'Origen',
      tipo: 'texto',
      spanClase: '',
    },
  ];

  proyectoActual: any;

  archivosSubidos: string[] = [];
  rutasArchivos: string[] = [];

  datosDelTrabajo: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tablaRef') tabla!: TablaComponent;
  mostrarTabla = 0;

  constructor(
    private apiAuthService: ApiAuthService,
    private apiLotesService: ApiLotesService,
    private apiProyectoService: ApiProyectosService,
    private apiDatosService: DatosService,
    private error: Error,
    private router: Router,
    private route: ActivatedRoute,
    private dat: DatosService,
    private sb: MatSnackBar
  ) {}

  ngOnInit() {
    this.apiProyectoService
      .getProyectoSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((proyecto) => {
        this.proyectoSeleccionado = proyecto;
      });

    this.apiLotesService
      .getLoteSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((lote) => {
        this.loteSeleccionado = lote;
        this.loadDatos(this.workId);
        console.log('DatosComponent montado');
      });
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
    console.log('🧹 DatosComponent destruido');
  }

  private loadDatos(workId: string): void {
    this.apiDatosService.list(workId)
    .pipe(
      switchMap(() => this.apiDatosService.getDatosPorTrabajoID(workId)),
      takeUntil(this.subscription)
    )
    .subscribe({
      next: (response: Datos[]) => {
        console.log("📥 Datos recibidos del backend:", response);

        const archivosUnicos = new Map<string, Datos>();
        response.forEach(item => {
          if (item.Archivo && !archivosUnicos.has(item.Archivo)) {
            archivosUnicos.set(item.Archivo, {
              ...item,
              Referencia: 'REF_001',
              OrdenProduccion: 'PROD_001',
              Origen: item.Origen ?? 'NC',
              Formato: item.Perfil?.[0] ?? '',
              Cubierto: item.archivo_usado === true ? '🟢' : '🔴',
            });
          }
        });

        this.datosDelTrabajo = Array.from(archivosUnicos.values());
        console.log('📦 Datos únicos por Archivo con campos extra:', this.datosDelTrabajo);
      },
      error: (err) => {
        console.error('❌ Error al cargar datos del trabajo:', err);
        this.sb.open('Error al cargar datos', 'Cerrar', { duration: 3000 });
      }
    });

  }

  getFormattedDate = (): string => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10);
    return `${datePart}`;
  };

  getFormattedDateTime = (): string => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10);
    const timePart = today.toTimeString().split(' ')[0];
    return `${datePart} ${timePart}`;
  };

  borrarDatos(): void {
    if (this.seleccionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin selección',
        text: 'No se ha seleccionado ningún dato para eliminar.',
        confirmButtonColor: '#f8a166',
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar los datos seleccionados?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f8a166',
    }).then((result) => {
      if (result.isConfirmed) {
        
        console.log("this.seleccionados: ", this.seleccionados);

        const ids = this.seleccionados.map(p => ({
          TrabajoID: p.TrabajoID,
          Archivo: p.Archivo
        }));

        this.apiDatosService.deleteDatos(ids).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Los datos fueron eliminados correctamente.',
              timer: 3000,
              showConfirmButton: false,
              position: 'top-end',
            });

            // // Actualiza la tabla}
            // this.dataSource.data = this.dataSource.data.filter(
            //   (lote) => !ids.LotesIDs.includes(lote._id)
            // );

            this.seleccionados = [];
            this.tabla.filtro = '';
            this.loadDatos(this.workId);
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al eliminar los datos.',
              confirmButtonColor: '#f8a166',
            });
          },
        });
      }
    });
  }

  actualizarSeleccionados(seleccionados: any[]): void {
    this.seleccionados = seleccionados;
  }

  clickRow(lote: any): void {
    //enviar informacion al componente padre sobre el elemento seleccionado para actualizar el select lote
    this.apiLotesService.actualizarLoteSeleccionado(lote);
    console.log("GGGGG")
    this.apiDatosService
      .list(lote._id)
      .pipe(takeUntil(this.subscription))
      .subscribe({
        next: (response) => {
          if (response !== null) {
            this.apiDatosService.setContexto(
              this.proyectoActual._id,
              lote._id,
              this.proyectoActual.name,
              lote.NombreTrabajo
            );
            this.router.navigate(['home/datos']);
          } else {
            this.error.showErrorSnackBar(
              'No se encontraron Datos para el lote.'
            );
          }
        },
        error: (err) => {
          this.error.showErrorSnackBar(
            'No se encontraron Datos para el lote'
          );
        },
      });
    // this.apiInventarioService
    //   .list(lote._id)
    //   .pipe(takeUntil(this.subscription))
    //   .subscribe({
    //     next: (response) => {
    //       if (response !== null) {
    //         this.apiInventarioService.setContexto(
    //           this.proyectoActual._id,
    //           lote._id,
    //           this.proyectoActual.name,
    //           lote.NombreTrabajo
    //         );
    //         this.router.navigate(['home/inventario']);
    //       } else {
    //         this.error.showErrorSnackBar(
    //           'No se encontraron inventarios para el lote.'
    //         );
    //       }
    //     },
    //     error: (err) => {
    //       this.error.showErrorSnackBar(
    //         'No se encontraron inventarios para el lote'
    //       );
    //     },
    //   });


  }

  async handleSendDrag(files: File[]): Promise<void> {
    try {
      console.log("📤 Subiendo archivos:", files.map(f => f.name));
      console.log("this.workId: ", this.workId);

      const response = await this.apiDatosService.uploadFiles(files, this.workId);
      console.log("📁 Archivos subidos:", response.files);
      console.log("📂 URLs generadas:", response.urls);

      this.archivosSubidos = response.files;
      this.rutasArchivos = response.urls;

      const piezas = await this.apiDatosService.postFilesData(this.rutasArchivos, this.workId);
      console.log("🧱 Piezas procesadas:", piezas);

      if (piezas) {
        await this.postPiezasProcesadas(piezas); // ✅ guardar en la base de datos
        await lastValueFrom(this.apiDatosService.list(this.workId)); // ✅ actualizar datos$
        const datos = await lastValueFrom(this.apiDatosService.getDatosPorTrabajoID(this.workId));
        this.datosDelTrabajo = this.procesarDatos(datos);
        console.log('📦 Datos únicos por Archivo con campos extra:', this.datosDelTrabajo);
      }

      this.sb.open('Archivo subido correctamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
      this.sb.open('Error al subir archivo', 'Cerrar', { duration: 3000 });
    }
  }

  private procesarDatos(datos: Datos[]): Datos[] {
    const archivosUnicos = new Map<string, Datos>();
    datos.forEach(item => {
      if (item.Archivo && !archivosUnicos.has(item.Archivo)) {
        archivosUnicos.set(item.Archivo, {
          ...item,
          Referencia: 'REF_001',
          OrdenProduccion: 'PROD_001',
          Origen: item.Origen ?? 'NC',
          Formato: item.Perfil?.[0] ?? '',
          Cubierto: item.archivo_usado === true ? '🟢' : '🔴',
        });
      }
    });
    return Array.from(archivosUnicos.values());
  }

  async postPiezasProcesadas(piezas: (Datos | DatosVM)[]): Promise<void> {
    try {
      const resultado = await this.apiDatosService.postPiezasData('piezas', piezas);
      console.log("🧱 Piezas guardadas en la base de datos:", resultado);
      this.loadDatos(this.workId); // recarga los datos desde la BD
      this.sb.open('Piezas guardadas correctamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error("❌ Error al guardar piezas:", error);
      this.sb.open('Error al guardar piezas', 'Cerrar', { duration: 3000 });
    }
  }

  async onFileInputChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    const allowedExtensions = ['.nc1', '.xlsx', '.xlsm'];
    const archivosNC1: File[] = [];

    try {
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const extension = allowedExtensions.find(ext => fileName.endsWith(ext));
        const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!isAllowed) {
          this.sb.open(`Archivo no permitido: ${file.name}`, 'Cerrar', { duration: 3000 });
          continue;
        }

        if (extension === '.nc1') {
          archivosNC1.push(file); // ✅ acumular para subir todos juntos
        } 
        else if (extension === '.xlsx' || extension === '.xlsm') {
          const data = await file.arrayBuffer();
          const wb = XLSX.read(data, { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json: Array<Record<string, any>> = XLSX.utils.sheet_to_json(sheet);

          const vms: DatosVM[] = [];

          for (const row of json) {
            const vm: DatosVM = {
              id: `new-${Date.now()}`,
              _id: row['_id'] ?? null,
              TrabajoID: this.workId,
              Archivo: row['Nombre de Pieza'] ?? '',
              Perfil: row['Formato'] ?? '',
              Formato: row['Perfil'] ?? '',
              Material: row['Material'] ?? '',
              Longitud: Number(row['Longitud (mm)'] ?? 0),
              Alto: Number(row['Alto (mm)'] ?? 0),
              Peso: Number(row['Peso (kg)'] ?? 0),
              Cantidad: Number(row['Cantidad'] ?? 0),
              Agujeros: row['Agujeros'] ?? '',
              Origen: 'Excel',
            };
            
            vms.push(vm); // ✅ Agregar al array
            console.log('🧱 VM generado:', vm);
            // await lastValueFrom(this.dat.upsert(this.workId, toAPI(vm)));
          }
          console.log('📦 Lista de VMs generados:', vms);
          await this.postPiezasProcesadas(vms); // ✅ guardar en la base de datos
          await lastValueFrom(this.apiDatosService.list(this.workId)); // ✅ actualizar datos$
          const datos = await lastValueFrom(this.apiDatosService.getDatosPorTrabajoID(this.workId));
          this.datosDelTrabajo = this.procesarDatos(datos);
          console.log('📦 Datos únicos por Archivo con campos extra:', this.datosDelTrabajo);
        }
      }

      // ✅ Subir todos los archivos NC1 juntos
      if (archivosNC1.length > 0) {
        await this.handleSendDrag(archivosNC1);
      }

      await this.loadDatos(this.workId);
      this.sb.open('Datos cargados', 'Cerrar', { duration: 2500 });
    } catch (err) {
      console.error('Error leyendo archivos', err);
      this.sb.open('Error al cargar archivo', 'Cerrar', { duration: 3000 });
    } finally {
      input.value = '';
    }
  }
}