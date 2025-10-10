import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-tabla-analisis',
  templateUrl: './tabla-analisis.component.html',
  styleUrl: './tabla-analisis.component.scss',
  standalone: false,
})
export class TablaAnalisisComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'proyecto',
    'perfil',
    'patronCorte',
    'cantidad',
    'piezas',
    'saldoMM',
    'longitud',
    'saldo%',
    'cortes',
  ];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  subColumns: string[] = [
    'nombrePieza',
    'cantidad',
    'cantidadTotal',
    'largo',
    'subTotal',
  ];

  dataSource = new MatTableDataSource<any>();

  @Input() data: any[] = [];
  @Input() proyecto: any;
  @Input() lote: any;
  @Input() hide: boolean = false;
  @Input() configuracion: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  expandedElement: any | null;

  columnsBase: string[] = [
    'proyecto',
    'perfil',
    'patronCorte',
    'cantidad',
    'piezas',
    'saldoMM',
    'longitud',
    'saldo%',
    'cortes',
    'expand',
  ];

  columnsExtras: string[] = ['graficoFila', 'expandedDetail'];

  resumenPerfiles: any;
  resumenSaldosYRestos: any;
  constructor() {}

  ngOnInit(): void {
    // this.dataSource.data = this.data;
    // console.log(this.data);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      const nuevaData = changes['data'].currentValue;

      // Reemplazamos el dataSource por uno nuevo para forzar el cambio
      this.dataSource = new MatTableDataSource(nuevaData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.getResumenPerfiles();
      this.obtenerSaldos();
    }
    if (changes['hide'] && !this.hide) {
      this.expandedElement = null;
    }
  }

  get columnsToRender(): string[] {
    return this.hide
      ? [...this.columnsBase]
      : [...this.columnsBase, ...this.columnsExtras];
  }

  isExpanded(element: any) {
    return this.expandedElement === element;
  }

  toggle(element: any) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  getSegmentDataFromString(
    element: any,
    longitudTotal: number
  ): {
    label: string;
    width: number;
    clase: string;
  }[] {
    const piezaStr = element.Piezas;
    const anchoSierra = this.configuracion.AnchoSierra || 0;
    const cortes = element.Cortes || 0;
    const piezasRaw = piezaStr.split('+').map((p: any) => p.trim());

    const longitudUtil = longitudTotal - anchoSierra * cortes;

    let acumulado = 0;

    const segmentos = piezasRaw.flatMap((piezaStr: any) => {
      const match = piezaStr.match(/^(.*?)\s*\(([\d.]+)\)$/);
      if (!match) return [];

      const nombre = match[1].trim();
      const largo = parseFloat(match[2]);
      const porcentaje = longitudUtil > 0 ? (largo / longitudUtil) * 100 : 0;
      acumulado += largo;

      const clase = nombre.includes('_') ? 'retazo-rayado' : 'retazo-gris';

      return [
        {
          label: `${nombre} (${largo})`,
          width: porcentaje,
          clase,
        },
      ];
    });

    // Agregar saldo si existe
    const saldo = element.DesplieguePiezas?.saldo || longitudUtil - acumulado;
    if (saldo > 0.1) {
      const porcentaje = (saldo / longitudUtil) * 100;
      segmentos.push({
        label: `Saldo (${saldo.toFixed(1)})`,
        width: porcentaje,
        clase: 'retazo-saldo',
      });
    }

    return segmentos;
  }

  obtenerSaldos() {
    const perfilesReducidos = Array.from(
      this.data
        .reduce((acc, item) => {
          const clave = `${item.Perfil}|${item.Calidad}`;
          if (!acc.has(clave)) {
            acc.set(clave, item);
          }
          return acc;
        }, new Map())
        .values()
    );
    console.log(perfilesReducidos);

    const totales: any = perfilesReducidos.reduce(
      (acc: any, item: any) => {
        acc.Barras += item.Barras || 0;
        acc.EmpatesTotal += item.EmpatesTotal || 0;
        acc.CortesTotal += item.CortesTotal || 0;
        acc.SaldoTotal += item.SaldoTotal || 0;
        acc.saldo_Corte_mm += item.saldo_Corte_mm || 0;
        acc.saldo_Residuo_mm += item.saldo_Residuo_mm || 0;

        acc.saldo_Disponible += item.saldo_Disponible || 0;
        acc.saldo_Corte += item.saldo_Corte || 0;
        acc.MermaMedia += item.MermaMedia || 0;

        return acc;
      },
      {
        Barras: 0,
        EmpatesTotal: 0,
        CortesTotal: 0,
        SaldoTotal: 0,
        saldo_Corte_mm: 0,
        saldo_Residuo_mm: 0,
        saldo_Disponible: 0,
        saldo_Corte: 0,
        MermaMedia: 0,
      }
    );

    const base = this.resumenPerfiles.reduce((acc: any, item: any) => {
      return acc + (item.cantidad || 0) * (item.longitud || 0);
    }, 0);

    // Calculamos el total combinado de saldos
    totales['SaldoConEmpate'] =
      totales.SaldoTotal + totales.saldo_Corte_mm + totales.saldo_Residuo_mm;
    totales['Saldototal(%)'] = (totales.SaldoConEmpate / base) * 100;
    
    totales['RestoUtilizable'] = totales.SaldoTotal;
    totales['RestoUtilizable(%)'] = (totales.SaldoTotal / base) * 100;

    totales['Desperdicio'] = totales.saldo_Corte_mm + totales.saldo_Residuo_mm;
    totales['Desperdicio(%)'] = (totales.Desperdicio / base) * 100;

    this.resumenSaldosYRestos = totales;
    console.log(totales);
  }

  getSaldoConEmpate() {
    const saldoTotal =
      this.data.at(0).SaldoTotal +
      this.data.at(0).saldo_Corte_mm +
      this.data.at(0).saldo_Residuo_mm;
    // console.log(saldoTotal);
    return saldoTotal;
  }

  getPiezas() {
    const piezas = this.data.reduce(
      (acc, actual) => acc + actual.Piezas.split('+').length,
      0
    );
    return piezas;
  }

  getResumenPerfiles() {
    const agrupados = Array.from(
      this.data
        .reduce((acc: any, item: any) => {
          const clave = `${item.Perfil}|${item['Longitud Stock Total']}`;
          if (!acc.has(clave)) {
            acc.set(clave, {
              perfil: item.Perfil,
              longitud: item['Longitud Stock Total'],
              cantidad: 1,
            });
          } else {
            acc.get(clave)!.cantidad += 1;
          }
          return acc;
        }, new Map())
        .values()
    );
    this.resumenPerfiles = agrupados;
    console.log(this.resumenPerfiles);
  }
}
