import { Component, OnInit } from '@angular/core';
import { ApiLotesService } from '../../services/lote.service';
import { ApiProyectosService } from '../../services/proyectos.service';
import { Subject, takeUntil } from 'rxjs';
import { Proyecto } from '../../models/proyecto';
import { Lote } from '../../models/lote';
import { ApiAnalisisService } from '../../services/analisis.service';
import { ApiConfiguracionService } from '../../services/configuracion.service';

@Component({
  selector: 'app-analisis',
  templateUrl: './analisis.component.html',
  styleUrl: './analisis.component.scss',
  standalone: false,
})
export class AnalisisComponent implements OnInit {
  subscription = new Subject<void>();
  proyectoSeleccionado: any;
  loteSeleccionado: any;

  dataPatronesConEmpate: any;
  dataPatronesSinEmpate: any;

  piezasConEmpate: any;
  piezasSinEmpate: any;
  piezas: any;
  configuracion: any;
  filtroInventarioPiezas: any;
  constructor(
    private apiLoteService: ApiLotesService,
    private apiProyectoService: ApiProyectosService,
    private apiAnalisisService: ApiAnalisisService,
    private apiConfiguracion: ApiConfiguracionService
  ) {}

  async ngOnInit() {
    console.log('analisis montado');

    await this.apiProyectoService
      .getProyectoSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((proyecto) => {
        this.proyectoSeleccionado = proyecto;
      });

    await this.apiLoteService
      .getLoteSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((lote) => {
        this.loteSeleccionado = lote;
      });

    await this.apiAnalisisService
      .getInventarioPiezas(this.loteSeleccionado._id)
      .pipe(takeUntil(this.subscription))
      .subscribe((filtroInventarioPiezas) => {
        this.filtroInventarioPiezas = filtroInventarioPiezas;
        console.log(filtroInventarioPiezas);
      });

    this.apiConfiguracion
      .getConfiguracion(this.loteSeleccionado._id)
      .pipe(takeUntil(this.subscription))
      .subscribe((configuracion) => {
        this.configuracion = configuracion;
        console.log('configuracion',configuracion);
      });
      
    this.apiAnalisisService
      .getPiezasConEmpate(this.loteSeleccionado._id)
      .pipe(takeUntil(this.subscription))
      .subscribe((piezasConEmpate) => {
        this.piezasConEmpate = piezasConEmpate;
        console.log('piezas con Empate',piezasConEmpate);
      });

    this.apiAnalisisService
      .getPiezasSinEmpate(this.loteSeleccionado._id)
      .pipe(takeUntil(this.subscription))
      .subscribe((piezasSinEmpate) => {
        this.piezasSinEmpate = piezasSinEmpate;
        // console.log(piezasSinEmpate);
      });

    this.apiAnalisisService
      .getPiezas(this.loteSeleccionado._id)
      .pipe(takeUntil(this.subscription))
      .subscribe((piezas) => {
        this.piezas = piezas;
        console.log('piezas',piezas);
      });
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
    console.log('🧹 analisis destruido');
  }

  ejecutarNesting(){

  }

  actualizar(){}

  limpiar(){}

  exportar(){}

  guardar(){}
}
