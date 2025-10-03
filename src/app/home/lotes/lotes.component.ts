import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ApiAuthService } from '../../services/apiauth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, Subject, take, takeUntil } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Auth } from '../../models/auth';
import { ApiLotesService } from '../../services/lote.service';
import { Usuario } from '../../models/usuario';
import { Lotes } from '../../models/lotes';
import Swal from 'sweetalert2';
import { TablaComponent } from '../../shared/tabla/tabla.component';
import { ApiProyectosService } from '../../services/proyectos.service';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.component.html',
  styleUrl: './lotes.component.scss',
  standalone: false,
})
export class LotesComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription = new Subject<void>();
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

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
  dataSource = new MatTableDataSource<Lotes>();
  selection = new SelectionModel<Lotes>(true, []);
  seleccionados: any[] = []; // te devuelve todos los LOTES que hayan sido seleccionados usando el checkbox

  columnasTabla = [
    {
      header: 'Nombre del lote',
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
      header: '#No cubiertos',
      key: 'no_cubiertos_count',
      tipo: 'numero',
      spanClase: 'chip orange text-align-right',
    },
    {
      header: 'Acciones',
      key: '',
      tipo: '',
      spanClase: '',
    },
  ];

  folder: any;

  tablaData: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tablaRef') tabla!: TablaComponent;
  mostrarTabla = 0;
  constructor(
    private apiAuthService: ApiAuthService,
    private apiLotesService: ApiLotesService,
    private apiProyectoService: ApiProyectosService,
    private router: Router,
    private route: ActivatedRoute,
    private paginatorIntl: MatPaginatorIntl 
  ) {}

  ngOnInit() {
    console.log('LotesComponent montado');
    this.apiProyectoService.folder$
      .pipe(
        distinctUntilChanged((prev, curr) => prev?._id === curr?._id),
        takeUntil(this.subscription)
      )
      .subscribe((folder) => {
        if (folder && folder._id && folder.name) {
          console.log('Recibido desde folder$:', folder);
          // setTimeout(() => {
            this.folder = folder;
            this.iniciar();
          // }, 0);
        } else {
          this.router.navigate(['home/proyectos']);
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
    console.log('🧹 LotesComponent destruido');
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
    this.paginatorIntl.changes.next();
  }

  iniciar() {
    const _idUser = this.apiAuthService.usuarioData._id;
    
    this.apiLotesService
      .getLotes(_idUser)
      .pipe(takeUntil(this.subscription))
      .subscribe((response) => {
        if (response !== null) {
          // Filtrar por folderID
          const lotesFiltrados = response
            .filter((lote: any) => lote.FolderID === this.folder._id)
            .map((lote: any) => {
              const cubiertos =
                lote.unique_perfiles?.reduce(
                  (acc: number, perfil: any) => acc + perfil.nUsados,
                  0
                ) || 0;

              return {
                ...lote,
                cubiertos_count: cubiertos,
                no_cubiertos_count: lote.piezas_count - cubiertos,
              };
            });
          // setTimeout(() => {
          this.tablaData = [...lotesFiltrados];
          this.mostrarTabla++;
          // console.log('Lotes filtrados:', lotesFiltrados);
          console.log('mostrarTabla activado:', this.mostrarTabla);
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
          FolderID: this.folder._id,//'68d4038efdb5289a63177008', // Hardcode temporal
          cubiertos_count: 0,
          id: this.folder._id,//  'DASDASS',
          no_cubiertos_count: 0,
          piezas_count: 0,
          _id: ""
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

            //this.router.navigate(['home/proyectos']);
            this.tablaData = [...this.tablaData, lote ];
            this.dataSource.data = [
              ...this.dataSource.data,
              lote,
            ];
            this.tabla.filtro = '';
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

            // Actualiza la tabla}
            this.dataSource.data = this.dataSource.data.filter(
              (lote) => !ids.LotesIDs.includes(lote._id)
            );

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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }
  actualizarSeleccionados(seleccionados: any[]): void {
    this.seleccionados = seleccionados;
  }

  clickRow(element: any): void {
    console.log(element);
  }
  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: Proyectos): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
  //     row.position + 1
  //   }`;
  // }
}
