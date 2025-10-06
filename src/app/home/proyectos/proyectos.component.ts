import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiAuthService } from '../../services/apiauth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, Subject, take, takeUntil } from 'rxjs';

import { ApiProyectosService } from '../../services/proyectos.service';
import { ApiLotesService } from '../../services/lote.service';
import { Usuario } from '../../models/usuario';
import { Proyecto } from '../../models/proyecto';
import Swal from 'sweetalert2';
import { TablaComponent } from '../../shared/tabla/tabla.component';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
  standalone: false,
})
export class ProyectosComponent implements OnInit, OnDestroy {
  subscription = new Subject<void>();
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

  seleccionados: any[] = []; // te devuelve todos los proyectos que hayan sido seleccionados usando el checkbox

  proyectos: Proyecto[] = [];

  columnasTabla = [
    {
      header: 'Nombre del proyecto',
      key: 'name',
      tipo: 'texto',
      // spanClase: '',
    },
    {
      header: 'Fecha de creación',
      key: 'createdAt',
      tipo: 'fecha',
      // spanClase: '',
    },
    {
      header: 'Última edición',
      key: 'updatedAt',
      tipo: 'fecha',
      // spanClase: '',
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
  @ViewChild('tablaRef') tabla!: TablaComponent;

  constructor(
    private apiAuthService: ApiAuthService,
    private apiProyectoService: ApiProyectosService,
    private apiLoteService: ApiLotesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('ProyectosComponent montado');
    this.apiProyectoService
      .getProyectos()
      .pipe(takeUntil(this.subscription))
      .subscribe((data) => {
        this.proyectos = data;
      });
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
    console.log('🧹 ProyectosComponent destruido');
  }

  crearProyecto() {
    Swal.fire({
      title: 'Ingrese el nombre del Proyecto',
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

        console.log(proyecto);
        
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
            this.apiProyectoService.actualizarListaProyectos(proyectoConCamposNumericos);

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
            // Actualiza la tabla
            this.apiProyectoService.eliminarProyectosLocalmente(ids.FolderIDs);

            // Actualiza la tabla}
            // this.dataSource.data = this.dataSource.data.filter(
            //   (proyecto) => !ids.FolderIDs.includes(proyecto._id)
            // );

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
    this.apiProyectoService.actualizarProyectoSeleccionado(element);
    this.apiLoteService.cargarLotes(element.userId)
    this.router.navigate(['home/lotes']); // o con parámetro
  }
}
