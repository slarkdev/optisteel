import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiAuthService } from '../../services/apiauth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Auth } from '../../models/auth';
import { ApiProyectosService } from '../../services/proyectos.service';
import { Usuario } from '../../models/usuario';
import { Proyectos } from '../../models/proyectos';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
  standalone: false,
})
export class ProyectosComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription = new Subject();
  usuarioLogeado: Usuario = this.apiAuthService.usuarioData;

  displayedColumns: string[] = [
    'select',
    'name',
    'createdAt',
    'updatedAt',
    'createdBy',
    'trabajos_count',
    'piezas_count',
  ];
  dataSource = new MatTableDataSource<Proyectos>();
  selection = new SelectionModel<Proyectos>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private apiAuthService: ApiAuthService,
    private apiProyectoService: ApiProyectosService,
    private router: Router,
    private route: ActivatedRoute,
    private paginatorIntl: MatPaginatorIntl
  ) {
    // this.paginatorIntl.itemsPerPageLabel = 'Ítems por página';
    // this.paginatorIntl.nextPageLabel = 'Siguiente página';
    // this.paginatorIntl.previousPageLabel = 'Página anterior';
    // this.paginatorIntl.firstPageLabel = 'Primera página';
    // this.paginatorIntl.lastPageLabel = 'Última página';
  }

  ngOnInit(): void {
    this.iniciar();
  }

  ngOnDestroy(): void {
    this.subscription.next;
    this.subscription.complete();
    //this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
    this.paginatorIntl.changes.next(); // ✅ aquí ya está todo enlazado
  }

  iniciar() {
    console.log(this.apiAuthService.usuarioData._id);
    const _idUser = this.apiAuthService.usuarioData._id;
    this.apiProyectoService
      .getProyectos(_idUser)
      .pipe(takeUntil(this.subscription))
      .subscribe((response) => {
        if (response !== null) {
          console.log(response);

          this.dataSource = new MatTableDataSource<Proyectos>(response);
          this.dataSource.paginator = this.paginator;
        }
      });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: Proyectos): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
  //     row.position + 1
  //   }`;
  // }
}
