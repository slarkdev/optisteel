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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Auth } from '../../models/auth';
import { ApiProyectosService } from '../../services/proyectos.service';
import { Usuario } from '../../models/usuario';
import { Proyectos } from '../../models/proyectos';
import Swal from 'sweetalert2';
import { Error } from '../../shared/error';
import { TablaComponent } from '../../shared/tabla/tabla.component';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
  standalone: false,
})
export class ProyectosComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription = new Subject();
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

  displayedColumns: string[] = [
    'select',
    'name',
    'createdAt',
    'updatedAt',
    'createdBy',
    'trabajos_count',
    'piezas_count',
  ];
  dataSource = new MatTableDataSource<Proyectos>();
  selection = new SelectionModel<Proyectos>(true, []);
  seleccionados: any[] = []; // te devuelve todos los proyectos que hayan sido seleccionados usando el checkbox

  columnasTabla = [
    {
      header: 'Nombre del proyecto',
      key: 'name',
      tipo: 'texto',
      spanClase: '',
    },
    {
      header: 'Fecha de creación',
      key: 'createdAt',
      tipo: 'fecha',
      spanClase: '',
    },
    {
      header: 'Última edición',
      key: 'updatedAt',
      tipo: 'fecha',
      spanClase: '',
    },
    { header: 'Creador', key: 'createdBy', tipo: 'texto', spanClase: '' },
    {
      header: '#Trabajos',
      key: 'trabajos_count',
      tipo: 'numero',
      spanClase: 'chip text-align-right',
    },
    {
      header: '#Piezas',
      key: 'piezas_count',
      tipo: 'numero',
      spanClase: 'chip orange text-align-right',
    },
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tablaRef') tabla!: TablaComponent;

  pageSize = 5;
  pageIndex = 0;
  constructor(
    private apiAuthService: ApiAuthService,
    private apiProyectoService: ApiProyectosService,
    private router: Router,
    private route: ActivatedRoute
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
    this.apiProyectoService
      .getProyectos(_idUser)
      .pipe(takeUntil(this.subscription))
      .subscribe((response) => {
        if (response !== null) {
          this.dataSource = new MatTableDataSource<Proyectos>(response);
          this.dataSource.paginator = this.paginator;
          //this.updatePage();
        }
      });
  }

  crearProyecto() {
    Swal.fire({
      title: 'Ingrese el nombre del Folder',
      input: 'text',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Crear',
      confirmButtonColor: '#f8a166',
      showLoaderOnConfirm: true,
      preConfirm: (nombreProyecto) => {
        const nombre = nombreProyecto?.trim();
        if (!nombre) {
          Swal.showValidationMessage('Ingrese un nombre de proyecto');
          return;
        }

        const proyecto = {
          name: nombre,
          userId: this.usuarioLogeado._id,
          userName: this.usuarioLogeado.UserName,
        };

        return this.apiProyectoService
          .addProyecto(proyecto)
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

  borrarProyecto(): void {
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
          FolderIDs: this.seleccionados.map((p) => p._id),
        };

        this.apiProyectoService.deleteProyectos(ids).subscribe({
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
              (proyecto) => !ids.FolderIDs.includes(proyecto._id)
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

  actualizarSeleccionados(seleccionados: any[]): void {
    this.seleccionados = seleccionados;
  }

  clickRow(element: any): void {
    console.log(element);
  }
}
