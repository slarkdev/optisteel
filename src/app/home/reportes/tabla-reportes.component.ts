import {
    Component, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';

export type ColReporte = {
    header: string;
    key: string;
    tipo: 'texto' | 'numero' | 'fecha' | 'porcentaje';
    spanClase?: string;
    /** grupo: '' | 'Sin empate' | 'Con empate' */
    grupo?: string;
    decimals?: number; 
};

@Component({
    selector: 'app-tabla-reportes',
    templateUrl: './tabla-reportes.component.html',
    styleUrls: ['./tabla-reportes.component.scss'],
    standalone: false
})
export class TablaReportesComponent implements OnChanges {
    @Input() data: any[] = [];
    @Input() columnas: ColReporte[] = [];
    @Input() pageSizeOptions: number[] = [10, 25, 50];

    @Output() filaDblClick = new EventEmitter<any>();
    @Output() seleccionadosChange = new EventEmitter<any[]>();

    // estado tabla
    filtro = '';
    dataFiltrada: any[] = [];
    pageSize = 10;
    pageIndex = 0;
    columnaOrden = '';
    ordenAscendente = true;

    /** encabezados agrupados */
    private leadingFixedColsCount = 1; // checkbox columna
    groupCells: Array<{ label: string; colspan: number; cssClass: string }> = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && changes['data'].currentValue) {
            this.dataFiltrada = [...this.data];
            this.pageIndex = 0;
        }
        if (changes['columnas']) {
            this.buildGroupHeaders();
        }
    }

    private buildGroupHeaders(): void {
        const cells: Array<{ label: string; colspan: number; cssClass: string }> = [];
        // checkbox
        cells.push({ label: '', colspan: this.leadingFixedColsCount, cssClass: 'group-empty' });

        let i = 0;
        while (i < this.columnas.length) {
            const g = (this.columnas[i].grupo ?? '').trim();
            let colspan = 1;
            let j = i + 1;
            while (j < this.columnas.length && (this.columnas[j].grupo ?? '').trim() === g) {
                colspan++; j++;
            }
            const cssClass =
                g === 'Sin empate' ? 'group-sin' :
                    g === 'Con empate' ? 'group-con' : 'group-empty';

            cells.push({ label: g, colspan, cssClass });
            i = j;
        }
        this.groupCells = cells;
    }

    // ---- selección
    get pagedData(): any[] {
        const start = this.pageIndex * this.pageSize;
        return this.dataFiltrada.slice(start, start + this.pageSize);
    }
    isAllSelected(): boolean {
        return this.pagedData.every(r => r.seleccionado);
    }
    toggleAll(ev: Event): void {
        const checked = (ev.target as HTMLInputElement).checked;
        this.pagedData.forEach(r => r.seleccionado = checked);
        this.emitSeleccionados();
    }
    emitSeleccionados(): void {
        this.seleccionadosChange.emit(this.dataFiltrada.filter(r => r.seleccionado));
    }

    // ---- búsqueda / orden
    filtrarTabla(): void {
        const texto = (this.filtro ?? '').trim().toLowerCase();

        let filtrados =
            texto.length < 3
                ? [...this.data]
                : this.data.filter(row =>
                    this.columnas.some(col => {
                        const val = this.formatearDato(col, row[col.key]);
                        return val?.toString().toLowerCase().includes(texto);
                    })
                );

        if (this.columnaOrden) {
            const colDef = this.columnas.find(c => c.key === this.columnaOrden);

            const toSortable = (val: any, col?: ColReporte) => {
                if (!col) return val;
                if (col.tipo === 'porcentaje') {
                    if (typeof val === 'string') {
                        // extrae número respetando coma/punto y % si viene
                        const n = Number(val.replace('%', '').replace(/\s/g, '').replace(',', '.'));
                        return isNaN(n) ? Number.NEGATIVE_INFINITY : n;
                    }
                    if (typeof val === 'number') return val;
                }
                return val;
            };

            filtrados.sort((a, b) => {
                const A = toSortable(a[this.columnaOrden], colDef);
                const B = toSortable(b[this.columnaOrden], colDef);

                // compara numérico si ambos son números, si no, como string
                if (typeof A === 'number' && typeof B === 'number') {
                    const cmp = A > B ? 1 : A < B ? -1 : 0;
                    return this.ordenAscendente ? cmp : -cmp;
                }
                const sA = String(A ?? ''), sB = String(B ?? '');
                const cmp = sA.localeCompare(sB, 'es');
                return this.ordenAscendente ? cmp : -cmp;
            });
        }

        this.dataFiltrada = filtrados;
        this.pageIndex = 0;
    }
    
    ordenarPor(key: string): void {
        if (this.columnaOrden === key) this.ordenAscendente = !this.ordenAscendente;
        else { this.columnaOrden = key; this.ordenAscendente = true; }
        this.filtrarTabla();
    }

    // ---- paginado
    get startIndex(): number { return this.pageIndex * this.pageSize; }
    get endIndex(): number { return Math.min(this.startIndex + this.pageSize, this.dataFiltrada.length); }
    isNextDisabled(): boolean { return this.endIndex >= this.dataFiltrada.length; }
    prevPage(): void { if (this.pageIndex > 0) this.pageIndex--; }
    nextPage(): void { if (!this.isNextDisabled()) this.pageIndex++; }
    onPageSizeChange(ev: Event): void {
        this.pageSize = parseInt((ev.target as HTMLSelectElement).value, 10);
        this.pageIndex = 0;
    }
    get rangoTexto(): string {
        const len = this.dataFiltrada.length;
        const ini = len === 0 ? 0 : this.startIndex + 1;
        const fin = Math.min(this.startIndex + this.pageSize, len);
        return `${ini}–${fin} de ${len}`;
    }

    // ---- formateo
    formatearDato(col: ColReporte, valor: any): string {
        if (col.tipo === 'porcentaje') {
            if (typeof valor === 'string') return valor;
            if (typeof valor === 'number') return `${valor}`;
            return valor ?? '';
        }
        if (col.tipo === 'numero') {
            return new Intl.NumberFormat('es-PE', { minimumFractionDigits: col.decimals ?? 0, maximumFractionDigits: col.decimals ?? 0 })
                .format(valor ?? 0);
        }
        if (col.tipo === 'fecha') {
            const d = new Date(valor);
            if (isNaN(d.getTime())) return valor;
            const p = (n: number) => String(n).padStart(2, '0');
            return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
        }
        return valor ?? '';
    }

    isNumericLike(col: ColReporte): boolean {
        return col.tipo === 'numero' || col.tipo === 'porcentaje';
    }
}
