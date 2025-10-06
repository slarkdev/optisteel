import { ApiLotesService } from './../../services/lote.service';
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
  tap,
} from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { Usuario } from '../../models/usuario';
import { Lote } from '../../models/lote';
import Swal from 'sweetalert2';
import { TablaComponent } from '../../shared/tabla/tabla.component';
import { ApiProyectosService } from '../../services/proyectos.service';
import { Proyecto } from '../../models/proyecto';
import { Datos } from '../../models/datos';
import { InventarioService } from '../../services/inventario.service';
import { Error } from '../../shared/error';
import { DatosService } from '../../services/datos.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrl: './datos.component.scss',
  standalone: false,
})
export class DatosComponent implements OnInit, OnDestroy {
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

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
    console.log("STATE: ", this.state);
    return this.state.lote;
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

  datosDelTrabajo: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tablaRef') tabla!: TablaComponent;
  mostrarTabla = 0;

  constructor(
    private apiAuthService: ApiAuthService,
    private apiLotesService: ApiLotesService,
    private apiProyectoService: ApiProyectosService,
    private apiInventarioService: InventarioService,
    private apiDatosService: DatosService,
    private error: Error,
    private router: Router,
    private route: ActivatedRoute,
    private dat: DatosService,
    private sb: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('DatosComponent montado');
    this.loadDatos();
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
    console.log('🧹 LotesComponent destruido');
  }
  private loadDatos() {
    this.apiDatosService.contexto$
      .pipe(takeUntil(this.subscription))
      .subscribe((ctx: any) => {
        this.state.proyecto = ctx?.idProyecto;
        this.state.lote = ctx?.idLote;

        this.nombreLote = ctx?.nombreLote;
        this.nombreProyecto = ctx?.nombreProyecto;

        console.log("OK");

        this.apiDatosService.getDatosPorTrabajoID(this.workId)
          .pipe(takeUntil(this.subscription))
          .subscribe((response: Datos[]) => {
            const archivosUnicos = new Map<string, Datos>();
            response.forEach(item => {
              if (!archivosUnicos.has(item.Archivo)) {
                archivosUnicos.set(item.Archivo, {
                  ...item,
                  Referencia: 'REF_001',
                  OrdenProduccion: 'PROD_001',
                  Origen: item.Origen ?? 'NC', // 👈 solo si no tiene Origen
                  Formato: item.Perfil?.[0] ?? '',// 👈 aquí se asigna Perfil
                  Cubierto: item.archivo_usado === true ? '🟢' : '🔴',
                });
              }
            });

            this.datosDelTrabajo = Array.from(archivosUnicos.values());
            console.log('Datos únicos por Archivo con campos extra:', this.datosDelTrabajo);
          });
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

  crearLote() {
    Swal.fire({
      title: 'Ingrese el nombre del lote',
      input: 'text',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Crear',
      confirmButtonColor: '#f8a166',
      showLoaderOnConfirm: true,
      preConfirm: (nombreProyecto) => {
        const nombre = nombreProyecto?.trim();
        if (!nombre) {
          Swal.showValidationMessage('Ingrese un nombre de lote');
          return;
        }

        const lote = {
          NombreTrabajo: nombre,
          UserID: [this.usuarioLogeado._id],
          CreadoPor: this.usuarioLogeado.UserName,
          FechaCreacion: this.getFormattedDate(),
          UltimaEdicion: this.getFormattedDateTime(),
          Organizacion: this.usuarioLogeado.Organizacion, //'Organizacion Ejemplo',
          OrganizacionID: this.usuarioLogeado.OrganizacionID, //'67538203842272d6e79123db',
          FolderID: this.proyectoActual._id, //'68d4038efdb5289a63177008', // Hardcode temporal
          cubiertos_count: 0,
          id:'', // NO DEBE SER IGUAL A NINGUNO ES ID UNICO  'DASDASS',
          no_cubiertos_count: 0,
          piezas_count: 0,
          _id: '',
        };

        return this.apiLotesService
          .addLote(lote)
          .pipe(take(1))
          .toPromise()
          .then((response: any) => {
            console.log('response de Lote: ', response);
            if (!response) {
              Swal.showValidationMessage(
                'Ocurrió un error, inténtelo más tarde'
              );
              return;
            }

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Lote Creado',
              showConfirmButton: false,
              timer: 3000,
            });
          })
          .catch(() => {
            Swal.showValidationMessage('Ocurrió un error, inténtelo más tarde');
          });
      },
    });
  }

  borrarLote(): void {
    if (this.seleccionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin selección',
        text: 'No se ha seleccionado ningún folder para eliminar.',
        confirmButtonColor: '#f8a166',
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar los folders seleccionados?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f8a166',
    }).then((result) => {
      if (result.isConfirmed) {
        const ids = {
          LotesIDs: this.seleccionados.map((p) => p._id),
        };
        this.apiLotesService.deleteLotes(ids).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Los lotes fueron eliminados correctamente.',
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
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al eliminar los lotes.',
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
}
