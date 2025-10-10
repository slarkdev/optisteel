import { Component, OnInit } from '@angular/core';
import { ApiLotesService } from '../../services/lote.service';
import { ApiProyectosService } from '../../services/proyectos.service';
import { firstValueFrom, Subject, switchMap, takeUntil } from 'rxjs';
import { Proyecto } from '../../models/proyecto';
import { Lote } from '../../models/lote';
import { ApiAnalisisService } from '../../services/analisis.service';
import { ApiConfiguracionService } from '../../services/configuracion.service';
import { FormControl } from '@angular/forms';

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
  perfilesSeleccionados = new FormControl();

  selectAllValue = '___all___';

  dataPiezasConEmpate: any;
  dataPiezasSinEmpate: any;
  todosSeleccionados: boolean = false;

  hide = false;
  constructor(
    private apiLoteService: ApiLotesService,
    private apiProyectoService: ApiProyectosService,
    private apiAnalisisService: ApiAnalisisService,
    private apiConfiguracion: ApiConfiguracionService
  ) {}

  async ngOnInit() {
    console.log('analisis montado');

    this.proyectoSeleccionado = await firstValueFrom(
      this.apiProyectoService
        .getProyectoSeleccionado()
        .pipe(takeUntil(this.subscription))
    );

    this.loteSeleccionado = await firstValueFrom(
      this.apiLoteService
        .getLoteSeleccionado()
        .pipe(takeUntil(this.subscription))
    );

    this.configuracion = await firstValueFrom(
      this.apiConfiguracion
        .getConfiguracion(this.loteSeleccionado._id)
        .pipe(takeUntil(this.subscription))
    );

    console.log('configuracion', this.configuracion);

    this.piezasConEmpate = await firstValueFrom(
      this.apiAnalisisService
        .getPiezasConEmpate(this.loteSeleccionado._id)
        .pipe(takeUntil(this.subscription))
    );
    console.log('piezasConEmpate', this.piezasConEmpate);

    this.piezasSinEmpate = await firstValueFrom(
      this.apiAnalisisService
        .getPiezasSinEmpate(this.loteSeleccionado._id)
        .pipe(takeUntil(this.subscription))
    );

    console.log('piezasSinEmpate', this.piezasSinEmpate);

    this.piezas = await firstValueFrom(
      this.apiAnalisisService
        .getPiezas(this.loteSeleccionado._id)
        .pipe(takeUntil(this.subscription))
    );

    console.log('piezas', this.piezas);

    this.filtroInventarioPiezas = await firstValueFrom(
      this.apiAnalisisService
        .getInventarioPiezas(this.loteSeleccionado._id)
        .pipe(takeUntil(this.subscription))
    );

    console.log('filtroInventarioPiezas', this.filtroInventarioPiezas);

    const sinDuplicados = this.filtroInventarioPiezas.filter(
      (item: any, index: number, self: any) =>
        index ===
        self.findIndex(
          (p: any) => p.Perfil === item.Perfil && p.Calidad === item.Calidad
        )
    );
    console.log('sin duplicados', sinDuplicados);

    this.filtroInventarioPiezas = sinDuplicados;
    const ultimoNesting = this.piezasConEmpate[this.piezasConEmpate.length - 1];
    const seleccionado =
      this.filtroInventarioPiezas.filter(
        (r: any) =>
          r.Perfil === ultimoNesting.Perfil &&
          r.Calidad === ultimoNesting.Calidad
      ) || [];

    this.perfilesSeleccionados.setValue([...seleccionado]);
    this.buscarDatosConPiezasySinPiezas();
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
    console.log('🧹 analisis destruido');
  }

  ejecutarNesting() {
    // this.perfilesSeleccionados.

    const datosPost = {
      trabajoId: this.loteSeleccionado._id,
      perfil: 'HS430X6X180X15',
      calidad: 'A572-G50',
    };

    this.apiAnalisisService
      .postPiezasConEmpateNesting(datosPost)
      .pipe(
        switchMap(() =>
          this.apiAnalisisService.getPiezasConEmpateNesting(
            datosPost.trabajoId,
            datosPost.perfil,
            datosPost.calidad
          )
        )
      )
      .subscribe({
        next: (respuestaGet) => {
          console.log('Datos recibidos:', respuestaGet);
          // acá podés actualizar tu tabla, mostrar visuales, etc.
        },
        error: (err) => {
          console.error('Error en el flujo Nesting:', err);
        },
      });
  }

  actualizar() {}

  limpiar() {}

  exportar() {}

  guardar() {}

  buscarDatosConPiezasySinPiezas() {
    // elementos que fueron seleccionados sin el check box de seleccionar todos
    let seleccionados =
      this.perfilesSeleccionados.value?.filter(
        (v: any) => v !== this.selectAllValue
      ) || [];

    if (seleccionados.length < this.filtroInventarioPiezas.length) {
      this.perfilesSeleccionados.setValue([...seleccionados]);
      seleccionados =
        this.perfilesSeleccionados.value?.filter(
          (v: any) => v !== this.selectAllValue
        ) || [];

      this.dataPiezasConEmpate = this.piezasConEmpate.filter((r: any) =>
        seleccionados.some(
          (s: any) => r?.Perfil === s?.Perfil && r?.Calidad === s?.Calidad
        )
      );
    }
    if (seleccionados.length === this.filtroInventarioPiezas.length) {
      this.perfilesSeleccionados.setValue([
        ...this.filtroInventarioPiezas,
        this.selectAllValue,
      ]);

      this.dataPiezasConEmpate = this.piezasConEmpate;
    }

    // reconfiguramos los datos para tener la estructura de la tabla
    this.transformarPiezasExpandibles(this.dataPiezasConEmpate);
  }

  transformarPiezasExpandibles(data: any[]) {
    const dataTransformada = data.map((item) => {
      const piezasRaw = item.Piezas.split('+');
      const longitudTotal = item.Cantidad; //['Longitud Stock Total'];

      const agrupadas = new Map<
        string,
        {
          nombrePieza: string;
          largo: number;
          cantidad: number;
          cantidadTotal: number;
        }
      >();

      piezasRaw.forEach((piezaStr: string) => {
        const match = piezaStr.match(/^(.*?)\s*\(([\d.]+)\)$/);
        if (!match) return;

        const cuerpo = match[1].trim(); // ej: "m316/4" o "m316/2_2"
        const largo = parseFloat(match[2]); // ej: 339

        let nombrePieza = cuerpo.includes('_') ? cuerpo : cuerpo.split('/')[0];

        const clave = `${nombrePieza}|${largo}`;
        if (!agrupadas.has(clave)) {
          agrupadas.set(clave, {
            nombrePieza,
            largo: largo,
            cantidad: 1,
            cantidadTotal: longitudTotal, // inicial
          });
        } else {
          const actual = agrupadas.get(clave)!;
          actual.cantidad += 1;
          actual.cantidadTotal = actual.cantidad * longitudTotal;
        }
      });

      console.log(agrupadas);
      
      return {
        ...item,
        detalleExpandido: Array.from(agrupadas.values()),
      };
    });

    this.dataPiezasConEmpate = dataTransformada;
    console.log(dataTransformada);
  }

  transformarDatosParaTabla(data: any[]) {
    this.dataPiezasConEmpate = data.map((item) => {
      const piezasRaw = item.Piezas.split('+') || [];
      const longitudTotal = item.Cantidad;

      const agrupadas = new Map<
        string,
        {
          nombrePieza: string;
          Largo: number;
          cantidad: number;
          cantidadTotal: number;
        }
      >();

      console.log(piezasRaw);

      piezasRaw.forEach((piezaStr: any) => {
        const match = piezaStr.match(/^(.*?)\s*\(([\d.]+)\)$/);
        if (!match) return;

        const cuerpo = match[1].trim();
        const largo = parseFloat(match[2]);

        let nombrePieza = cuerpo.includes('_') ? cuerpo : cuerpo.split('/')[0];

        const clave = `${nombrePieza}|${largo}`;
        if (!agrupadas.has(clave)) {
          agrupadas.set(clave, {
            nombrePieza,
            Largo: largo,
            cantidad: 1,
            cantidadTotal: longitudTotal, // inicial
          });
        } else {
          const actual = agrupadas.get(clave)!;
          actual.cantidad += 1;
          actual.cantidadTotal = actual.cantidad * longitudTotal;
        }
      });

      return {
        ...item,
        detalleExpandido: Array.from(agrupadas.values()),
      };
    });

    console.log(this.dataPiezasConEmpate);
  }

  splitPiezas(data: any) {
    console.log(data);
  }
  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
    this.todosSeleccionados = !this.todosSeleccionados;

    if (!this.todosSeleccionados) {
      this.perfilesSeleccionados.setValue([]);
      this.dataPiezasConEmpate = [];
    } else {
      this.perfilesSeleccionados.setValue([
        ...this.filtroInventarioPiezas,
        this.selectAllValue,
      ]);
      this.dataPiezasConEmpate = this.piezasConEmpate;
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    console.log(this.hide);
    event.stopPropagation();
  }
}
