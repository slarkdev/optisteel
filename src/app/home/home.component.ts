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
import { Proyecto } from '../models/proyecto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
  private _idUser = this.apiAuthService.usuarioData._id;
  subscription = new Subject<void>();
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

  showSidenav: boolean = false;
  selectedValue: string = '';

  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;
  proyectos: Proyecto[] = [];
  proyectoSeleccionado: any | null = null;

  lotes: any[] = [];
  loteSeleccionado: any;

  loteDeshabilitado = true;
  proyectoDeshabilitado = true;
  isLoadingLote = false;
  isLoadingProyecto = true;

  isExpanded = false;
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
    console.log('home cargando proyectos,');

    this.proyectoDeshabilitado = true;
    this.isLoadingProyecto = true;

    this.apiProyectoService.cargarProyectos(this._idUser);

    this.apiProyectoService.proyectos$
      .pipe(takeUntil(this.subscription))
      .subscribe((data) => {
        this.proyectos = data;
      });

    this.apiProyectoService
      .getProyectoSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((proyecto) => {
        this.proyectoSeleccionado = proyecto;
      });

    this.apiLoteService.lotesFiltrados$
      .pipe(takeUntil(this.subscription))
      .subscribe((data) => {
        this.lotes = [...data]; 
      });

    this.apiLoteService
      .getLoteSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((lote) => {
        this.loteSeleccionado = lote;
      });

    this.isLoadingProyecto = false;
    this.proyectoDeshabilitado = false;
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
  }

  logout() {
    this.apiAuthService.logout();
    this.router.navigate(['login']);
  }

  async buscarLotesPorProyecto(): Promise<void> {
    console.log('click en select de buscar lotes ');

    this.loteSeleccionado = null;
    this.isLoadingLote = true;
    this.loteDeshabilitado = true;

    await this.apiProyectoService.actualizarProyectoSeleccionado(
      this.proyectoSeleccionado
    );
    await this.apiLoteService.cargarLotes(this._idUser);

    this.isLoadingLote = false;
    this.loteDeshabilitado = false;
    this.router.navigate(['home/lotes']);
  }

  async buscarInventarioPorLote() {
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

            this.apiLoteService.actualizarLoteSeleccionado(this.loteSeleccionado);
            this.router.navigate(['home/datos']);
          } else {
            this.error.showErrorSnackBar(
              'No se encontraron inventarios para el lote.'
            );
          }
        },
        error: (err) => {
          this.error.showErrorSnackBar(
            'No se encontraron inventarios para el lote'
          );
        },
      });
  }

  navigateToProyectos() {
    console.log('navegar a proyectos');

    this.proyectoSeleccionado = null;
    this.loteSeleccionado = null;
    this.loteDeshabilitado = true;
    // this.router.navigate(['home/proyectos']);
    // this.toggleSidenav();
  }

  toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
  }
}
