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

      console.log('Datos actualizados:', nuevaData);
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

  getSegmentDataFicticio(): { width: number; color: string; label: string }[] {
    const valores = [
      { valor: 40, color: '#f44336', label: 'A' },
      { valor: 25, color: '#2196f3', label: 'B' },
      { valor: 15, color: '#4caf50', label: 'C' },
      { valor: 20, color: '#ff9800', label: 'D' },
    ];

    const total = valores.reduce((acc, seg) => acc + seg.valor, 0);

    return valores.map((seg) => ({
      width: (seg.valor / total) * 100,
      color: seg.color,
      label: seg.label,
    }));
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
}
