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
  estadoSeleccionado: string | null = null;
  usadosParaMostrar: string = '';

  dataPatronesConEmpate: any;
  dataPatronesSinEmpate: any;

  piezasConEmpate: any;
  piezasSinEmpate: any;
  nUsados: number = 0;
  nNoUsados: number = 0;
  nTotal: number = 0;
  stock: string = 'No hay stock';
  piezas: any;
  configuracion: any;

  filtroInventarioPiezas: any;
  perfilesSeleccionados = new FormControl();

  selectAllValue = '___all___';

  dataPiezasConEmpate: any;
  dataPiezasSinEmpate: any;
  todosSeleccionados: boolean = false;

  hide = false;
  tabSeleccionado: string = '1';
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

    console.log(ultimoNesting);
    
    const seleccionado =
      this.filtroInventarioPiezas.filter(
        (r: any) =>
          r.Perfil === ultimoNesting?.Perfil &&
          r.Calidad === ultimoNesting?.Calidad
      ) || [];

    this.perfilesSeleccionados.setValue([...seleccionado]);
    this.buscarDatosConPiezasySinPiezas();

    const piezasUnicasMap = new Map<
      string,
      {
        Usados: string;
        nUsados: number;
        NoUsados: string;
        nNoUsados: number;
        Total: string;
        nTotal: number;
      }
    >();

    this.piezasConEmpate.forEach(
      (pieza: {
        Usados: string;
        nUsados: number;
        NoUsados: string;
        nNoUsados: number;
        Total: string;
        nTotal: number;
      }) => {
        const clave = pieza.Usados.trim(); // Puedes normalizar más si es necesario
        if (!piezasUnicasMap.has(clave)) {
          piezasUnicasMap.set(clave, pieza);
        }
      }
    );

    // Paso 2: Obtener los objetos únicos
    const piezasUnicas = Array.from(piezasUnicasMap.values());

    // Paso 3: Sumar los nUsados solo de los objetos únicos
    this.nUsados = piezasUnicas.reduce(
      (acc: number, pieza) => acc + (pieza.nUsados || 0),
      0
    );
    this.nNoUsados = piezasUnicas.reduce(
      (acc: number, pieza) => acc + (pieza.nNoUsados || 0),
      0
    );
    this.nTotal = piezasUnicas.reduce(
      (acc: number, pieza) => acc + (pieza.nTotal || 0),
      0
    );
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

  actualizar() {

  }

  limpiar() {
    this.usadosParaMostrar = '';
    this.nUsados = 0;
    this.nNoUsados = 0;
    this.nTotal = 0;
    this.piezasConEmpate = [];
    this.piezasSinEmpate = [];
    this.dataPatronesConEmpate = [];
    this.dataPatronesSinEmpate = [];
    // this.filtroInventarioPiezas = [];
  }

  exportar() {}

  guardar() {}

  buscarDatosConPiezasySinPiezas() {
    this.dataPiezasConEmpate = [];
    let dataPiezasConEmpate = [];
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

      dataPiezasConEmpate = this.piezasConEmpate.filter((r: any) =>
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

      dataPiezasConEmpate = this.piezasConEmpate;
    }

    // reconfiguramos los datos para tener la estructura de la tabla
    this.transformarPiezasExpandibles(dataPiezasConEmpate);
  }

  transformarPiezasExpandibles(data: any[]) {
    const dataTransformada = data.map((item) => {
      const piezasRaw = item.Piezas.split('+').map((p: any) => p.trim());
      const cantidadPieza = item.Cantidad;

      const agrupadas = new Map<
        string,
        {
          nombrePieza: string;
          largo: number;
          cantidad: number;
          cantidadTotal: number;
          subTotal: number;
        }
      >();

      piezasRaw.forEach((piezaStr: string) => {
        const match = piezaStr.match(/^(.*?)\s*\(([\d.]+)\)$/);
        if (!match) return;

        const cuerpo = match[1].trim(); // ej: "m112/40" o "m5/3_2"
        const largo = parseFloat(match[2]);

        // 🔍 Agrupación por nombre base
        // const nombrePieza = cuerpo.includes('_')
        //   ? cuerpo
        //   : cuerpo.split('/')[0];

        // // ✅ Clave solo por nombre base
        // const clave = nombrePieza;

        const nombrePieza = cuerpo.includes('_')
          ? cuerpo
          : cuerpo.split('/')[0];
        const clave = `${nombrePieza}|${largo}`;

        if (!agrupadas.has(clave)) {
          agrupadas.set(clave, {
            nombrePieza,
            largo,
            cantidad: 1,
            cantidadTotal: cantidadPieza,
            subTotal: 1 * largo,
          });
        } else {
          const actual = agrupadas.get(clave)!;
          actual.cantidad += 1;
          actual.cantidadTotal = actual.cantidad * cantidadPieza;
          actual.subTotal = actual.cantidad * largo;
        }
      });

      const detalleExpandido = Array.from(agrupadas.values());

      const sumaLargos = detalleExpandido.reduce(
        (acc, pieza) => acc + pieza.subTotal, //pieza.largo * pieza.cantidad,
        0
      );

      const longitudTotal = item['Longitud Stock Total'] ?? 0;

      const saldo =
        longitudTotal -
        (sumaLargos + this.configuracion.AnchoSierra * item.Cortes);

      detalleExpandido.push({
        nombrePieza: 'Saldo',
        largo: '--' as any,
        cantidad: '--' as any,
        cantidadTotal: '--' as any,
        subTotal: saldo,
      });

      return {
        ...item,
        detalleExpandido,
      };
    });

    this.dataPiezasConEmpate = [...dataTransformada];
    console.log(this.dataPiezasConEmpate);
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
      this.buscarDatosConPiezasySinPiezas();
      //this.dataPiezasConEmpate = buscarDatosConPiezasySinPiezas [...this.piezasConEmpate];
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    console.log(this.hide);
    event.stopPropagation();
  }

  toggleEstado(estado: string) {
    this.estadoSeleccionado =
      this.estadoSeleccionado === estado ? null : estado;

    const campoPorEstado: Record<
      string,
      keyof (typeof this.piezasConEmpate)[0]
    > = {
      cubiertos: 'Usados',
      noCubiertos: 'NoUsados',
      total: 'Total',
    };

    const campo = campoPorEstado[this.estadoSeleccionado ?? ''];

    if (campo) {
      const concatenado = Array.from(
        new Set(
          this.piezasConEmpate.flatMap((pieza: any) =>
            pieza[campo]
              ?.split(',')
              .map((u: string) => u.trim())
              .filter((u: string) => u !== '')
          )
        )
      ).join(', ');

      this.usadosParaMostrar =
        concatenado.length > 0 ? concatenado : 'No hay piezas';
    } else {
      this.usadosParaMostrar = '';
    }

    if (this.usadosParaMostrar !== 'No hay piezas') {
      const piezasRaw = this.usadosParaMostrar; // o cualquier string con las piezas separadas por coma

      const resumenPorRaiz: Record<string, number> = {};

      piezasRaw.split(',').forEach((pieza) => {
        const limpia = pieza.trim();
        const partes = limpia.split('/');
        if (partes.length === 2) {
          const raiz = partes[0];
          resumenPorRaiz[raiz] = (resumenPorRaiz[raiz] || 0) + 1;
        }
      });

      // Convertir a array de strings tipo "raíz (cantidad)"
      const resumenFormateado = Object.entries(resumenPorRaiz).map(
        ([raiz, cantidad]) => `${raiz} (${cantidad})`
      );

      // Mostrar o guardar
      console.log('Resumen por raíz:', resumenFormateado);
      this.usadosParaMostrar = resumenFormateado.join(', ');
    }
  }

  seleccionarTab(valor: string) {
    this.tabSeleccionado = valor;
  }

  
}
