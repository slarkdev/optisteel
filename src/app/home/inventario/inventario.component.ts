import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  effect,
  signal,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import {
  catchError,
  distinctUntilChanged,
  forkJoin,
  lastValueFrom,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import { InventarioService } from '../../services/inventario.service';
import { InventoryVM, toAPI, toVM } from './inventario.adapters';
import { UpdateDialogComponent } from './update-dialog/update-dialog.component';
import { MatDialog } from '@angular/material/dialog';

type Calidad = string; // ya no restringimos

// Fila de borrador (para alta manual)
type DraftVM = InventoryVM & { __draft?: true };

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InventarioComponent implements OnInit, OnDestroy {
  private saveTimers = new Map<number, any>();
  subscription = new Subject<void>();
  state = {
    proyecto: 'OPTISTEEL — Producción 2025',
    lote: '67891bc85f0d85bddfcb6abc',
  };

  nombreLote: string = '';
  nombreProyecto: string = '';

  onStateChanged() {}
  get workId() {
    return this.state.lote;
  }

  constructor(
    private inv: InventarioService,
    private sb: MatSnackBar,
    private dialog: MatDialog
  ) {}

  // ====== STATE (datos) ======
  private items = signal<InventoryVM[]>([]);

  // Fila “en blanco” para creación manual
  private makeEmptyVM(): DraftVM {
    return {
      id: 0,
      _id: null,
      perfil: '',
      calidad: '',
      longitud: 0,
      cantidad: 0,
      consumido: 0,
      piezaMasLarga: 0,
      __draft: true,
    };
  }
  newRow = signal<DraftVM>(this.makeEmptyVM());

  // Buscar + filtros con signals
  private searchTermSig = signal(''); // texto de búsqueda
  private onlyAvailableSig = signal(false); // cantidad > 0
  filtersOpen = false;

  // Facetas (si luego las usas en UI)
  perfilesFacetSig = computed(() =>
    Array.from(new Set(this.items().map((i) => (i.perfil ?? '').trim())))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'es'))
  );
  calidadesFacetSig = computed(() =>
    Array.from(new Set(this.items().map((i) => this.normCalidad(i.calidad))))
      .filter(Boolean)
      .sort()
  );
  selectedPerfiles = signal<Set<string>>(new Set());
  selectedCalidades = signal<Set<string>>(new Set());

  // selección y paginación con signals
  selected = new Set<number>();
  private pageSig = signal(1);
  private pageSizeSig = signal(20);

  ngOnInit() {
    this.loadInventory();
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
  }

  private loadInventory() {
    this.inv.contexto$
      .pipe(
        takeUntil(this.subscription),
        switchMap((ctx: any) => {
          this.state.proyecto = ctx?.idProyecto;
          this.state.lote = ctx?.idLote;

          this.nombreLote = ctx?.nombreLote;
          this.nombreProyecto = ctx?.nombreProyecto;
          return this.inv.list(this.workId); // o ctx.idLote si depende del contexto
        })
      )
      .subscribe({
        next: (rows) => {
          const vm = rows.map((r, idx) => {
            const v = toVM(r, idx + 1);
            return { ...v, calidad: this.normCalidad(v.calidad) };
          });
          this.items.set(vm);
          this.goToPage(1);
        },
        error: (err) => {
          console.error('Inventario list error', err);
          this.sb.open('Error al cargar inventario', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }
  // private loadInventory() {
  //   this.inv.contexto$.pipe(takeUntil(this.subscription)).subscribe((ctx) => {
  //     console.log(ctx);

  //     this.state.proyecto = ctx?.idProyecto;
  //     this.state.lote = ctx?.idLote;
  //   });

  //   this.inv.list(this.workId).subscribe({
  //     next: (rows) => {
  //       const vm = rows.map((r, idx) => {
  //         const v = toVM(r, idx + 1);
  //         return { ...v, calidad: this.normCalidad(v.calidad) };
  //       });
  //       this.items.set(vm);
  //       this.goToPage(1);
  //     },
  //     error: (err) => {
  //       console.error('Inventario list error', err);
  //       this.sb.open('Erral cargar inventario', 'Cerrar', {
  //         duration: 3000,
  //       });
  //     },
  //   });
  // }

  // ====== BRIDGES para NO tocar tu HTML ======
  get searchTerm() {
    return this.searchTermSig();
  }
  set searchTerm(v: string) {
    this.onSearchChange(v);
  }

  get onlyAvailable() {
    return this.onlyAvailableSig();
  }
  set onlyAvailable(v: boolean) {
    this.onOnlyAvailableChange(v);
  }

  get pagedItems() {
    return this.pagedSig();
  }

  get pageSize() {
    return this.pageSizeSig();
  }
  set pageSize(v: number) {
    this.onPageSizeChange(v);
  }

  get page() {
    return this.pageSig();
  }

  get filtered() {
    return this.filteredSig();
  }

  // ====== helpers filtros / texto ======
  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }
  onSearchChange(v: string) {
    this.searchTermSig.set((v || '').trim());
    this.goToPage(1);
  }
  onOnlyAvailableChange(v: boolean) {
    this.onlyAvailableSig.set(!!v);
    this.goToPage(1);
  }
  applyFilters() {
    this.goToPage(1);
  }

  // Normalizador de calidad
  normCalidad = (s: string) =>
    (s || '').toUpperCase().replace(/\s+/g, '').trim();

  togglePerfil(p: string, checked: boolean) {
    const set = new Set(this.selectedPerfiles());
    const key = (p ?? '').trim();
    if (checked) set.add(key);
    else set.delete(key);
    this.selectedPerfiles.set(set);
    this.goToPage(1);
  }
  toggleCalidad(c: string, checked: boolean) {
    const set = new Set(this.selectedCalidades());
    const key = this.normCalidad(c);
    if (checked) set.add(key);
    else set.delete(key);
    this.selectedCalidades.set(set);
    this.goToPage(1);
  }
  clearFacet(kind: 'perfil' | 'calidad') {
    if (kind === 'perfil') this.selectedPerfiles.set(new Set());
    else this.selectedCalidades.set(new Set());
    this.goToPage(1);
  }

  // ====== master checkbox ======
  get masterChecked() {
    return (
      this.selected.size > 0 && this.selected.size === this.pagedSig().length
    );
  }
  get masterIndeterminate() {
    return (
      this.selected.size > 0 && this.selected.size < this.pagedSig().length
    );
  }

  // ====== filtro base ======
  private filterFn = (it: InventoryVM) => {
    const search = this.searchTermSig().toLowerCase();
    const txt = `${(it.perfil || '').toString()} ${this.normCalidad(
      it.calidad
    )}`.toLowerCase();
    if (search && !txt.includes(search)) return false;

    const perfilesSel = this.selectedPerfiles();
    const calSel = this.selectedCalidades();
    if (perfilesSel.size && !perfilesSel.has((it.perfil ?? '').trim()))
      return false;
    if (calSel.size && !calSel.has(this.normCalidad(it.calidad))) return false;

    if (this.onlyAvailableSig() && (it.cantidad ?? 0) <= 0) return false;
    return true;
  };

  // ====== derivados ======
  filteredSig = computed(() => this.items().filter(this.filterFn));
  pagedSig = computed(() => {
    const page = this.pageSig();
    const size = this.pageSizeSig();
    const start = (page - 1) * size;
    return this.filteredSig().slice(start, start + size);
  });

  get totalPages() {
    const size = this.pageSizeSig();
    return Math.max(1, Math.ceil(this.filteredSig().length / size));
  }
  get rangeStart() {
    const total = this.filteredSig().length;
    return total ? (this.pageSig() - 1) * this.pageSizeSig() + 1 : 0;
  }
  get rangeEnd() {
    return Math.min(
      this.pageSig() * this.pageSizeSig(),
      this.filteredSig().length
    );
  }

  private _repage = effect(() => {
    const tp = Math.max(
      1,
      Math.ceil(this.filteredSig().length / this.pageSizeSig())
    );
    if (this.pageSig() > tp) this.pageSig.set(tp);
  });

  // ====== paginación / selección ======
  goToPage(n: number) {
    const tp = this.totalPages;
    const clamped = Math.min(Math.max(1, n), tp);
    this.pageSig.set(clamped);
    this.selected.clear();
  }
  onPageSizeChange(n: number) {
    const size = Math.max(1, Number(n) || 20);
    this.pageSizeSig.set(size);
    this.goToPage(1);
  }
  prevPage() {
    this.goToPage(this.pageSig() - 1);
  }
  nextPage() {
    this.goToPage(this.pageSig() + 1);
  }

  toggleAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) this.pagedSig().forEach((it) => this.selected.add(it.id));
    else this.pagedSig().forEach((it) => this.selected.delete(it.id));
  }
  toggleOne(id: number, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) this.selected.add(id);
    else this.selected.delete(id);
  }
  anySelected() {
    return this.selected.size > 0;
  }

  // ====== borrar / importar / guardar ======
  deleteSelected() {
    this.confirmAndDeleteSelected();
  }

  async confirmAndDeleteSelected() {
    if (!this.anySelected()) {
      this.sb.open('No hay filas seleccionadas', 'Cerrar', { duration: 2200 });
      return;
    }
    const ok = window.confirm('¿Eliminar las filas seleccionadas?');
    if (!ok) return;

    const current = this.items();
    const rowsToDelete = current.filter((r) => this.selected.has(r.id));
    const backendIds = rowsToDelete
      .map((r) => r._id)
      .filter((v): v is string => !!v);

    try {
      if (backendIds.length)
        await lastValueFrom(this.inv.deleteMany(backendIds));
      this.items.set(current.filter((r) => !this.selected.has(r.id)));
      this.selected.clear();
      this.goToPage(this.pageSig());
      this.loadInventory();
      this.sb.open('Elementos eliminados', 'Cerrar', { duration: 2500 });
    } catch (e) {
      console.error(e);
      this.sb.open('Error al eliminar', 'Cerrar', { duration: 3000 });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (
      (e.key === 'Delete' || e.key === 'Del' || e.key === 'Supr') &&
      this.anySelected()
    ) {
      this.confirmAndDeleteSelected();
    }
  }

  async onFileInputChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: Array<Record<string, any>> = XLSX.utils.sheet_to_json(sheet);

      for (const row of json) {
        const vm: InventoryVM = {
          id: Date.now(),// this.items().length + 1,
          _id: row['_id'] ?? null,
          perfil: row['Perfil'] ?? '',
          calidad: this.normCalidad(row['Calidad'] ?? ''),
          longitud: Number(row['Longitud'] ?? 0),
          cantidad: Number(row['Cantidad'] ?? 0),
          consumido: Number(row['Consumido'] ?? 0),
          piezaMasLarga: Number(row['Long_mas_larga'] ?? 0),
        };
        await lastValueFrom(this.inv.upsert(this.workId, toAPI(vm)));
      }

      this.loadInventory();
      this.sb.open('Inventario cargado', 'Cerrar', { duration: 2500 });
    } catch (err) {
      console.error('Error leyendo Excel', err);
      this.sb.open('Error al cargar archivo', 'Cerrar', { duration: 3000 });
    } finally {
      input.value = '';
    }
  }

  private alnum = /^[a-zA-Z0-9]+$/;
  private validateRow(vm: InventoryVM) {
    return (
      !!vm.calidad &&
      this.alnum.test(vm.calidad) &&
      !!vm.perfil &&
      this.alnum.test(vm.perfil) &&
      vm.longitud > 0 &&
      vm.cantidad > 0
    );
  }

  // ====== edición en línea (filas existentes) ======
  onCellEdit(
    row: InventoryVM,
    key: 'perfil' | 'calidad' | 'longitud' | 'cantidad',
    value: any
  ) {
    console.log('onCellEdit');

    const updated = this.items().map((r) => {
      if (r.id !== row.id) return r;

      let v: any = value;
      if (key === 'longitud' || key === 'cantidad') v = Number(value ?? 0) || 0;
      if (key === 'calidad') v = this.normCalidad(String(value ?? ''));

      return { ...r, [key]: v };
    });

    this.items.set(updated);

    const vm = updated.find((r) => r.id === row.id)!;
    this.saveRowSoon(vm);
  }

  commitEdit(e: Event) {
    console.log('commitEdit');

    (e as any)?.preventDefault?.();
    (e.target as HTMLElement)?.blur?.();
  }

  saveRowSoon(vm: InventoryVM) {
    console.log('save row soon', vm);

    const prev = this.saveTimers.get(vm.id);
    if (prev) clearTimeout(prev);
    const t = setTimeout(() => this.saveRow(vm), 500);
    this.saveTimers.set(vm.id, t);
  }

  saveRow(vm: InventoryVM) {
    console.log('save row');

    if (!this.validateRow(vm)) {
      this.sb.open(
        `Fila ${vm.id}: hay campos obligatorios sin completar`,
        'Cerrar',
        { duration: 3200 }
      );
      return;
    }

    this.inv.upsert(this.workId, toAPI(vm)).subscribe({
      next: (res: any) => {
        const newId = Array.isArray(res) ? res?.[0]?._id : res?._id;
        if (newId) {
          this.items.update((list) =>
            list.map((x) => (x.id === vm.id ? { ...x, _id: newId } : x))
          );
        }
        this.sb.open(`Fila ${vm.id} guardada`, 'Cerrar', { duration: 2000 });
      },
      error: () =>
        this.sb.open('Error al guardar fila', 'Cerrar', { duration: 3000 }),
    });
  }

  // ====== edición/alta en la fila en blanco (draft) ======
  private isRowReady(vm: InventoryVM) {
    return (
      !!vm.perfil?.trim() &&
      !!vm.calidad?.trim() &&
      (vm.longitud ?? 0) > 0 &&
      (vm.cantidad ?? 0) > 0
    );
  }

  onDraftEdit<K extends keyof InventoryVM>(key: K, value: any) {
    const current = this.newRow();
    let v: any = value;
    if (key === 'longitud' || key === 'cantidad') v = Number(value ?? 0) || 0;
    if (key === 'calidad') v = this.normCalidad(String(value ?? ''));
    this.newRow.set({ ...current, [key]: v } as DraftVM);
  }

  saveDraftIfReady() {
    const vm = this.newRow();
    if (!this.isRowReady(vm)) return;

    this.inv.upsert(this.workId, toAPI(vm)).subscribe({
      next: (res: any) => {
        this.sb.open('Fila creada', 'Cerrar', { duration: 2000 });
        this.newRow.set(this.makeEmptyVM()); // reponer otra fila vacía
        this.loadInventory(); // refrescar listado
      },
      error: () =>
        this.sb.open('Error al crear fila', 'Cerrar', { duration: 3000 }),
    });
  }

  trackById = (_: number, it: InventoryVM) => it.id;

  async modificarCantidadLongitud() {
    if (!this.anySelected()) {
      this.sb.open('No hay filas seleccionadas', 'Cerrar', { duration: 2200 });
      return;
    }
    const dialogRef = this.dialog.open(UpdateDialogComponent, {
      width: '300px',
      data: { cantidad: 0, longitud: 0 },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const { cantidad, longitud } = result;
      // Usar estos datos para actualizar las filas seleccionadas

      const current = this.items();
      const rowsToUpdate = current.filter((r) => this.selected.has(r.id));

      const updatedRows = rowsToUpdate.map((r) => ({
        ...r,
        cantidad,
        longitud,
      }));

      const updateCalls = updatedRows.map((r) => {
        console.log('Actualizando fila:', r);

        return this.inv.upsert(this.workId, toAPI(r)).pipe(
          map((res: any) => {
            const newId = Array.isArray(res) ? res?.[0]?._id : res?._id;
            if (newId) {
              this.items.update((list) =>
                list.map((x) => (x.id === r.id ? { ...x, _id: newId } : x))
              );
            }
            return { success: true };
          }),
          catchError((err) => {
            return of({ error: true });
          })
        );
      });

      forkJoin(updateCalls).subscribe((results) => {
        const hasError = results.some((res: any) => res?.error);

        if (hasError) {
          this.sb.open('Algunas filas no se pudieron actualizar', 'Cerrar', {
            duration: 4000,
          });
        } else {
          this.sb.open('Todas las filas fueron actualizadas', 'Cerrar', {
            duration: 2000,
          });
        }

        this.loadInventory();
      });
    });
    //
  }
}
