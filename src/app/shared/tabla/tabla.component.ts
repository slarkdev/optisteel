import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.scss',
  standalone: false,
})
export class TablaComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Output() seleccionadosChange = new EventEmitter<any[]>();
  @Output() filaClick = new EventEmitter<any>();

  @Input() columnas: {
    header: string;
    key: string;
    tipo: string;
    spanClase: string;
    // tdClase: string;
  }[] = [];

  dataFiltrada: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  filtro: string = '';
  columnaOrden: string = '';
  ordenAscendente: boolean = true;

  ngOnInit(): void {
    this.dataFiltrada = [...this.data];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.dataFiltrada = [...this.data];
      this.pageIndex = 0;
      console.log('Datos actualizados:', this.dataFiltrada);
    }
  }

  emitSeleccionados() {
    this.seleccionadosChange.emit(this.getSeleccionados());
  }

  get startIndex(): number {
    return this.pageIndex * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.dataFiltrada.length);
  }

  // get pagedData(): any[] {
  //   return this.data.slice(this.startIndex, this.endIndex);
  // }

  get rangoTexto(): string {
    const length = this.dataFiltrada.length;
    const inicio = length === 0 ? 0 : this.startIndex + 1;
    const fin = Math.min(this.startIndex + this.pageSize, length);
    return `${inicio}–${fin} de ${length}`;
  }

  isNextDisabled(): boolean {
    return this.endIndex >= this.dataFiltrada.length;
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  nextPage(): void {
    if (!this.isNextDisabled()) {
      this.pageIndex++;
    }
  }

  onPageSizeChange(event: Event): void {
    const newSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize = newSize;
    this.pageIndex = 0;
  }

  isAllSelected(): boolean {
    return this.pagedData.every((row) => row.seleccionado);
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.pagedData.forEach((row) => (row.seleccionado = checked));
    this.emitSeleccionados();
  }

  getSeleccionados(): any[] {
    return this.dataFiltrada.filter((row) => row.seleccionado);
  }

  formatearDato(col: any, valor: any): string {
    if (col.tipo === 'numero') {
      return new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(valor);
    }

    if (col.tipo === 'fecha') {
      return this.formatearFecha(valor);
    }

    return valor;
  }

  formatearFecha(valor: any): string {
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return valor; // No es una fecha válida

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();

    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
  }

  filtrarTabla(): void {
    const texto = this.filtro.trim().toLowerCase();

    let filtrados =
      texto.length < 3
        ? [...this.data]
        : this.data.filter((row) =>
            this.columnas.some((col) => {
              const valorFormateado = this.formatearDato(col, row[col.key]);
              return valorFormateado?.toString().toLowerCase().includes(texto);
            })
          );

    // ✅ Ordenar si hay columna activa
    if (this.columnaOrden) {
      filtrados.sort((a, b) => {
        const valorA = a[this.columnaOrden];
        const valorB = b[this.columnaOrden];

        if (valorA == null) return 1;
        if (valorB == null) return -1;

        const comparacion =
          typeof valorA === 'string'
            ? valorA.localeCompare(valorB)
            : valorA > valorB
            ? 1
            : valorA < valorB
            ? -1
            : 0;

        return this.ordenAscendente ? comparacion : -comparacion;
      });
    }

    this.dataFiltrada = filtrados;
    this.pageIndex = 0;
  }

  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.filtrarTabla(); // ← ahora también ordena
  }

  get pagedData(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.dataFiltrada.slice(start, start + this.pageSize);
  }
}
