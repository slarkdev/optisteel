import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabla-analisis',
  templateUrl: './tabla-analisis.component.html',
  styleUrl: './tabla-analisis.component.scss',
  standalone: false,
})
export class TablaAnalisisComponent implements OnInit {
  displayedColumns: string[] = ['proyecto', 'perfil', 'patronCorte', 'cantidad', 'piezas', 'saldoMM', 'longitud', 'saldo%', 'cortes'];

  @Input() data: any[] = [];
  @Input() proyecto: any;
  @Input() lote: any;

  constructor(){

  }

  ngOnInit(): void {
    console.log(this.data);
  
  }
}
