import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ApiAuthService } from '../services/apiauth.service';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { ApiProyectosService } from '../services/proyectos.service';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Usuario } from '../models/usuario';
import { ApiLotesService } from '../services/lote.service';
import { InventarioService } from '../services/inventario.service';
import { Error } from '../shared/error';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
  subscription = new Subject<void>();
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

  showSidenav: boolean = false;
  selectedValue: string = '';

  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;
  proyectos: any[] = [];
  proyectoSeleccionado: any;

  lotes: any[] = [];
  loteSeleccionado: any;

  loteDeshabilitado = true;
  proyectoDeshabilitado = true;
  isLoadingLote = false;
  isLoadingProyecto = true;
  constructor(
    private apiAuthService: ApiAuthService,
    private apiProyectoService: ApiProyectosService,
    private apiLoteService: ApiLotesService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private apiInventarioService: InventarioService,
    private error: Error
  ) {
    this.apiAuthService.initializeSession();
    this.breakpointObserver
      .observe(['(max-width: 849px)'])
      .subscribe((result) => {
        if (result.matches) {
          this.drawerMode = 'over';
          this.drawerOpened = false;
        } else {
          this.drawerMode = 'side';
          this.drawerOpened = true;
        }
      });
  }
  ngOnInit() {
    this.proyectoDeshabilitado = true;
    this.isLoadingProyecto = true;
    const _idUser = this.apiAuthService.usuarioData._id;

    // obtenemos el proyecto seleccionado y actualizamos el select de proyectos
    // this.apiLoteService.loter$
    //       .pipe(
    //         distinctUntilChanged((prev, curr) => prev?._id === curr?._id),
    //         takeUntil(this.subscription)
    //       )
    //       .subscribe((proyecto) => {
    //         if (proyecto && proyecto._id && proyecto.name) {
    //           console.log('Recibido desde proyectos$:', proyecto);
    //           // setTimeout(() => {
    //             this.proyecto = proyecto;
    //             this.iniciar();
    //           // }, 0);
    //         } else {
    //           this.router.navigate(['home/proyectos']);
    //         }
    //       });

    
    this.apiProyectoService
      .getProyectos(_idUser)
      .pipe(takeUntil(this.subscription))
      .subscribe((response) => {
        if (response !== null) {
          this.proyectos = response;
          this.isLoadingProyecto = false;
          this.proyectoDeshabilitado = false;
          // console.log(response);
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
  }

  logout() {
    this.apiAuthService.logout();
    this.router.navigate(['login']);
  }

  buscarLotesPorProyecto(): void {
    this.isLoadingLote = true;
    this.loteDeshabilitado = true;
    console.log('click en select');
    // this.apiProyectoService.setFolder(this.proyectoSeleccionado);
    // console.log(this.proyectoSeleccionado);

    // if (this.router.url !== '/home/lotes') {
    //   this.router.navigate(['home/lotes']);
    // }
    const _idUser = this.apiAuthService.usuarioData._id;

    this.apiLoteService
      .getLotes(_idUser)
      .pipe(takeUntil(this.subscription))
      .subscribe((response) => {
        if (response !== null) {
          // Filtrar por folderID
          const lotesFiltrados = response.filter(
            (lote: any) => lote.FolderID === this.proyectoSeleccionado._id
          );

          // .map((lote: any) => {
          //   const cubiertos =
          //     lote.unique_perfiles?.reduce(
          //       (acc: number, perfil: any) => acc + perfil.nUsados,
          //       0
          //     ) || 0;

          //   return {
          //     ...lote,
          //     cubiertos_count: cubiertos,
          //     no_cubiertos_count: lote.piezas_count - cubiertos,
          //   };
          //}
          //);
          this.isLoadingLote = false;
          this.loteDeshabilitado = false;
          this.lotes = lotesFiltrados;
        }
      });
  }

  buscarInventarioPorLote() {
    this.apiInventarioService
      .list(this.loteSeleccionado._id)
      .pipe(takeUntil(this.subscription))
      .subscribe({
        next: (response) => {
          if (response !== null) {
            this.apiInventarioService.setContexto(
              this.proyectoSeleccionado._id,
              this.loteSeleccionado._id,
              this.proyectoSeleccionado.name,
              this.loteSeleccionado.NombreTrabajo
            );
            this.router.navigate(['home/inventario']);
          } else {
            this.error.showErrorSnackBar('No se encontraron inventarios para el lote.');
          }
        },
        error: (err) => {
          this.error.showErrorSnackBar(
            'No se encontraron inventarios para el lote',
          );
        },
      });
  }
}
