import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';

type Calidad = 'S235JR' | 'S275JR';

interface InventarioItem {
  id: number;
  perfil: string;
  calidad: Calidad;
  longitud: number;
  cantidad: number;
  consumido: number;
  piezaMasLarga: number;
}

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InventarioComponent {
  state = { proyecto: 'OPTISTEEL — Producción 2025', lote: 'PRUEBAS_NO_BORRAR' };
  onStateChanged() {}

  private readonly seed: InventarioItem[] = [
    { id: 1, perfil: 'HEA240', calidad: 'S235JR', longitud: 12000, cantidad: 100, consumido: 0, piezaMasLarga: 10257 },
    { id: 2, perfil: 'IPE300', calidad: 'S235JR', longitud: 12000, cantidad: 100, consumido: 0, piezaMasLarga: 10657 },
    { id: 3, perfil: 'HEB200', calidad: 'S275JR', longitud: 12000, cantidad: 100, consumido: 0, piezaMasLarga: 8265 },
    { id: 4, perfil: 'IPE200', calidad: 'S275JR', longitud: 12000, cantidad: 100, consumido: 0, piezaMasLarga: 3175 },
    { id: 5, perfil: 'IPE160', calidad: 'S275JR', longitud: 12000, cantidad: 100, consumido: 0, piezaMasLarga: 3579 },
    { id: 6, perfil: 'HEB160', calidad: 'S275JR', longitud: 12000, cantidad: 100, consumido: 0, piezaMasLarga: 7664 },
  ];

  // estado
  private items = signal<InventarioItem[]>(this.seed);
  searchTerm = '';
  onlyAvailable = false;
  hideZeroQty = false;
  materials: Record<Calidad, boolean> = { S235JR: true, S275JR: true };

  // selección y paginación
  selected = new Set<number>();
  page = 1;
  pageSize = 20;

  get masterChecked() { return this.selected.size > 0 && this.selected.size === this.pagedItems.length; }
  get masterIndeterminate() { return this.selected.size > 0 && this.selected.size < this.pagedItems.length; }

  // filtros
  private _searchLower = '';
  filtersOpen = false;
  toggleFilters() { this.filtersOpen = !this.filtersOpen; }
  onSearchChange(v: string) { this._searchLower = (v || '').toLowerCase().trim(); this.goToPage(1); }
  applyFilters() { this.goToPage(1); }

  private filterFn = (it: InventarioItem) => {
    const txt = `${it.perfil} ${it.calidad}`.toLowerCase();
    if (this._searchLower && !txt.includes(this._searchLower)) return false;
    if (!this.materials[it.calidad]) return false;
    if (this.onlyAvailable && it.longitud <= 0) return false;
    if (this.hideZeroQty && it.cantidad <= 0) return false;
    return true;
  };

  // derivados
  filteredSig = computed(() => this.items().filter(this.filterFn));
  pagedSig = computed(() => {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredSig().slice(start, start + this.pageSize);
  });

  get filtered() { return this.filteredSig(); }
  get pagedItems() { return this.pagedSig(); }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get rangeStart() { return this.filtered.length ? (this.page - 1) * this.pageSize + 1 : 0; }
  get rangeEnd() { return Math.min(this.page * this.pageSize, this.filtered.length); }

  private _repage = effect(() => {
    const tp = Math.max(1, Math.ceil(this.filteredSig().length / this.pageSize));
    if (this.page > tp) this.page = tp;
  });

  // acciones
  goToPage(n: number) { this.page = Math.min(Math.max(1, n), this.totalPages); this.selected.clear(); }
  prevPage() { this.goToPage(this.page - 1); }
  nextPage() { this.goToPage(this.page + 1); }

  toggleAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) this.pagedItems.forEach(it => this.selected.add(it.id));
    else this.pagedItems.forEach(it => this.selected.delete(it.id));
  }
  toggleOne(id: number, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) this.selected.add(id); else this.selected.delete(id);
  }
  anySelected() { return this.selected.size > 0; }
  deleteSelected() {
    const toDelete = new Set(this.selected);
    this.items.update(list => list.filter(it => !toDelete.has(it.id)));
    this.selected.clear();
    this.goToPage(this.page);
  }

  trackById = (_: number, it: InventarioItem) => it.id;
}
