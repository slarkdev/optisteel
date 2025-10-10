import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-tabla-analisis',
  templateUrl: './tabla-analisis.component.html',
  styleUrl: './tabla-analisis.component.scss',
  standalone: false,
})
export class TablaAnalisisComponent implements OnInit {
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
  subColumns: string[] = ['nombrePieza', 'cantidad', 'cantidadTotal', 'Largo'];

  dataSource = new MatTableDataSource<any>();

  @Input() data: any[] = [];
  @Input() proyecto: any;
  @Input() lote: any;
  @Input() hide: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  expandedElement: any | null;

  constructor() {}

  ngOnInit(): void {
    console.log(this.data);
  }
  ngAfterViewInit() {
    this.dataSource.data = this.data;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  isExpanded(element: any) {
    return this.expandedElement === element;
  }

  /** Toggles the expanded state of an element. */
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
}
