import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiAuthService } from '../../services/apiauth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Auth } from '../../models/auth';
import { ApiLotesService } from '../../services/lotes.service';
import { Usuario } from '../../models/usuario';
import { Lotes } from '../../models/lotes';
import Swal from 'sweetalert2';
import { TablaComponent } from '../../shared/tabla/tabla.component';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.component.html',
  styleUrl: './lotes.component.scss',
  standalone: false
})
export class LotesComponent implements OnInit, OnDestroy, AfterViewInit{
  subscription = new Subject();
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
    'actions'
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tablaRef') tabla!: TablaComponent;

  constructor(
    private apiAuthService: ApiAuthService,
    private apiLotesService: ApiLotesService,
    private router: Router,
    private route: ActivatedRoute,
    private paginatorIntl: MatPaginatorIntl
  ) {
    // this.paginatorIntl.itemsPerPageLabel = 'Ítems por página';
    // this.paginatorIntl.nextPageLabel = 'Siguiente página';
    // this.paginatorIntl.previousPageLabel = 'Página anterior';
    // this.paginatorIntl.firstPageLabel = 'Primera página';
    // this.paginatorIntl.lastPageLabel = 'Última página';
  }

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
    this.paginatorIntl.changes.next(); // ✅ aquí ya está todo enlazado
  }

  iniciar() {
    console.log("_ID")
    console.log(this.apiAuthService.usuarioData._id);
    const _idUser = this.apiAuthService.usuarioData._id;
    console.log(_idUser);
    const folderID = '68d4038efdb5289a63177008'; // Hardcode temporal

    this.apiLotesService
      .getLotes(_idUser)
      .pipe(takeUntil(this.subscription))
      .subscribe((response) => {
        if (response !== null) {
          console.log("RESPONSE:")
          console.log(response);
          
          // Filtrar por folderID
          const lotesFiltrados = response.filter((lote: any) => lote.FolderID === folderID);
          console.log("lotesFiltrados");
          console.log(lotesFiltrados);
          lotesFiltrados.forEach((lote: any) => {
            const cubiertos = lote.unique_perfiles?.reduce((acc: number, perfil: any) => acc + perfil.nUsados, 0) || 0;
            lote.cubiertos_count = cubiertos;
            lote.no_cubiertos_count = lote.piezas_count - cubiertos;
          });

          this.dataSource = new MatTableDataSource<Lotes>(lotesFiltrados);
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

        const lotes = {
          NombreTrabajo: nombre,
          UserID: [this.usuarioLogeado._id],
          CreadoPor: this.usuarioLogeado.UserName,
          FechaCreacion: this.getFormattedDate(),
          UltimaEdicion: this.getFormattedDateTime(),
          Organizacion: "Organizacion Ejemplo",
          OrganizacionID: "67538203842272d6e79123db",
          FolderID: '68d4038efdb5289a63177008', // Hardcode temporal
          cubiertos_count: 0,
          id: "DASDASS",
          no_cubiertos_count: 0, 
          piezas_count: 0,
        };

        return this.apiLotesService
          .addLotes(lotes)
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
              title: 'Proyecto Creado',
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
          id: this.seleccionados.map((p) => p._id),
        };

        this.apiLotesService.deleteLotes(ids).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Los proyectos fueron eliminados correctamente.',
              timer: 3000,
              showConfirmButton: false,
              position: 'top-end',
            });

            // Actualiza la tabla}
            this.dataSource.data = this.dataSource.data.filter(
              (proyecto) => !ids.id.includes(proyecto._id)
            );

            this.seleccionados = [];
            this.tabla.filtro = '';
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al eliminar los proyectos.',
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
