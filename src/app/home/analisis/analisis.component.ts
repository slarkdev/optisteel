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
  estadoSeleccionado: string | null = null; 
  usadosParaMostrar: string = '';

  dataPatronesConEmpate: any;
  dataPatronesSinEmpate: any;

  piezasConEmpate: any;
  piezasSinEmpate: any;
  nUsados: number = 0;
  nNoUsados: number = 0;
  nTotal: number = 0;
  stock: string = "No hay stock";
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
        const piezasUnicasMap = new Map<
          string, { Usados: string; nUsados: number;
                    NoUsados: string; nNoUsados: number;
                    Total: string; nTotal: number}
          >();

        this.piezasConEmpate.forEach((pieza: { Usados: string; nUsados: number; NoUsados: string; nNoUsados: number;
                    Total: string; nTotal: number}) => {
          const clave = pieza.Usados.trim(); // Puedes normalizar más si es necesario
          if (!piezasUnicasMap.has(clave)) {
            piezasUnicasMap.set(clave, pieza);
          }
        });

        // Paso 2: Obtener los objetos únicos
        const piezasUnicas = Array.from(piezasUnicasMap.values());

        // Paso 3: Sumar los nUsados solo de los objetos únicos
        this.nUsados = piezasUnicas.reduce(
          (acc: number, pieza) => acc + (pieza.nUsados || 0), 0);
        this.nNoUsados = piezasUnicas.reduce(
          (acc: number, pieza) => acc + (pieza.nNoUsados || 0), 0);
        this.nTotal = piezasUnicas.reduce(
          (acc: number, pieza) => acc + (pieza.nTotal || 0), 0);

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

  limpiar(){
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

  exportar(){}

  guardar(){}

  toggleEstado(estado: string) {
    this.estadoSeleccionado = this.estadoSeleccionado === estado ? null : estado;

    const campoPorEstado: Record<string, keyof typeof this.piezasConEmpate[0]> = {
      cubiertos: 'Usados',
      noCubiertos: 'NoUsados',
      total: 'Total'
    };

    const campo = campoPorEstado[this.estadoSeleccionado ?? ''];

    if (campo) {
      const concatenado = Array.from(
        new Set(
          this.piezasConEmpate
            .flatMap((pieza: any) =>
              pieza[campo]?.split(',').map((u: string) => u.trim()).filter((u: string) => u !== '')
            )
        )
      ).join(', ');

      this.usadosParaMostrar = concatenado.length > 0 ? concatenado : 'No hay piezas';
    } else {
      this.usadosParaMostrar = '';
    }

    if (this.usadosParaMostrar !== 'No hay piezas')    
    {
      const piezasRaw = this.usadosParaMostrar; // o cualquier string con las piezas separadas por coma

      const resumenPorRaiz: Record<string, number> = {};

      piezasRaw.split(',').forEach(pieza => {
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
}
