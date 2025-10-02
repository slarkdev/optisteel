import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Usuario } from '../../models/usuario';
import { Subject, take, takeUntil } from 'rxjs';
import { ApiAuthService } from '../../services/apiauth.service';
import { Lotes } from '../../models/lotes';
import { MatPaginator } from '@angular/material/paginator';
import { TablaComponent } from '../../shared/tabla/tabla.component';
import { ApiLotesService } from '../../services/lote.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.component.html',
  styleUrl: './lotes.component.scss',
  standalone: false,
})
export class LotesComponent implements OnInit, AfterViewInit, OnDestroy {
  subscription = new Subject();
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

  dataSource = new MatTableDataSource<Lotes>();
  seleccionados: any[] = [];
  columnasTabla = [
    {
      header: 'Nombre del Lote',
      key: 'NombreTrabajo',
      tipo: 'texto',
      spanClase: '',
    },
    {
      header: 'Fecha de creación',
      key: 'FechaCreacion',
      tipo: 'fecha',
      spanClase: '',
    },
    {
      header: 'Última edición',
      key: 'UltimaEdicion',
      tipo: 'fecha',
      spanClase: '',
    },
    { header: 'Creador', key: 'CreadoPor', tipo: 'texto', spanClase: '' },
    {
      header: '#Piezas',
      key: 'piezas_count',
      tipo: 'numero',
      spanClase: 'chip text-align-right',
    },
    {
      header: '#Cubiertos',
      key: 'cubiertos_count',
      tipo: 'numero',
      spanClase: 'chip orange text-align-right',
    },
    {
      header: '#NoCubiertos',
      key: 'no_cubiertos_count',
      tipo: 'numero',
      spanClase: 'chip grey text-align-right',
    },

    {
      header: 'Acciones',
      key: 'acciones',
      tipo: 'texto',
      spanClase: '',
    },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tablaRef') tabla!: TablaComponent;
  constructor(
    private apiAuthService: ApiAuthService,
    private apiLotesService: ApiLotesService
  ) {}

  ngOnInit(): void {
    this.iniciar();
  }

  ngOnDestroy(): void {
    this.subscription.next;
    this.subscription.complete();
    //this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  iniciar() {
    console.log(this.apiAuthService.usuarioData._id);
    const _idUser = this.apiAuthService.usuarioData._id;

    this.apiLotesService
      .getLotes(_idUser)
      .pipe(takeUntil(this.subscription))
      .subscribe((response) => {
        if (response !== null) {
          console.log(response);

          const rowsWithId = response.map((row: any, index: number) => {
            let piezas_count = row.piezas_count ?? 0;
            const cubiertos_count =
              row.unique_perfiles?.reduce(
                (acc: number, item: any) => acc + item.nUsados,
                0
              ) ?? 0;

            // Ajustar piezas_count si es menor que cubiertos_count
            if (cubiertos_count > piezas_count) {
              piezas_count = cubiertos_count;
            }

            return {
              ...row,
              id: row._id || index,
              NombreTrabajo: row.NombreTrabajo ?? 'No especificado',
              FechaCreacion: row.FechaCreacion ?? 'Fecha desconocida',
              UltimaEdicion: row.UltimaEdicion ?? 'No hay edición',
              CreadoPor: row.CreadoPor ?? 'Desconocido',
              Organización: row.Organización ?? 'Sin organización',
              PiezasOriginales: row.PiezasOriginales ?? 'Sin piezas',
              piezas_count,
              cubiertos_count,
              no_cubiertos_count: piezas_count - cubiertos_count,
            };
          });

          // let rows= rowsWithId.filter((e) => e.FolderID === selectedFolder._id); // Filter trabajos by folder
              
          this.dataSource = new MatTableDataSource<Lotes>(rowsWithId);
          this.dataSource.paginator = this.paginator;
          //this.updatePage();
        }
      });
  }

  crearLote() {
    Swal.fire({
      title: 'Ingrese el nombre del Lote',
      input: 'text',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Crear',
      confirmButtonColor: '#f8a166',
      showLoaderOnConfirm: true,
      preConfirm: (nombreLote) => {
        const nombre = nombreLote?.trim();
        if (!nombre) {
          Swal.showValidationMessage('Ingrese un nombre de proyecto');
          return;
        }

        const lote = {
          NombreTrabajo: nombre,
          PiezasOriginales: ['0'],
          UltimaEdicion: new Date(),
        };

        return this.apiLotesService
          .addLote(lote)
          .pipe(take(1))
          .toPromise()
          .then((response: any) => {
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

            const proyectoConCamposNumericos = {
              ...response,
              piezas_count: response.piezas_count ?? 0,
              trabajos_count: response.trabajos_count ?? 0,
            };

            //this.router.navigate(['home/proyectos']);
            this.dataSource.data = [
              ...this.dataSource.data,
              proyectoConCamposNumericos,
            ];
            this.tabla.filtro = '';
          })
          .catch(() => {
            Swal.showValidationMessage('Ocurrió un error, inténtelo más tarde');
          });
      },
    });
  }

  borrarSeleccion() {}

  actualizarSeleccionados(seleccionados: any[]): void {
    this.seleccionados = seleccionados;
  }

  clickRow(element: any): void {
    console.log(element);
  }
}
