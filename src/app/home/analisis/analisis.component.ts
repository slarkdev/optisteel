import { Component, OnInit } from '@angular/core';
import { ApiLotesService } from '../../services/lote.service';
import { ApiProyectosService } from '../../services/proyectos.service';
import { Subject, takeUntil } from 'rxjs';
import { Proyecto } from '../../models/proyecto';
import { Lote } from '../../models/lote';

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
  constructor(
    private apiLoteService: ApiLotesService,
    private apiProyectoService: ApiProyectosService
  ) {}

  ngOnInit(): void {
    this.apiProyectoService
      .getProyectoSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((proyecto) => {
        this.proyectoSeleccionado = proyecto;
      });

    this.apiLoteService
      .getLoteSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((lote) => {
        this.loteSeleccionado = lote;
      });
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
    console.log('🧹 analisis destruido');
  }
}
