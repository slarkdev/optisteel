import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiConfiguracionService } from '../../services/configuracion.service';
import { ApiLotesService } from '../../services/lote.service';
import { Lote } from '../../models/lote';
import { Subject, takeUntil } from 'rxjs';
import { ApiProyectosService } from '../../services/proyectos.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
  standalone: false,
})
export class ConfiguracionComponent implements AfterViewInit, OnDestroy {
  subscription = new Subject<void>();

  @ViewChild('sA') sA!: ElementRef<HTMLInputElement>;
  @ViewChild('sB') sB!: ElementRef<HTMLInputElement>;
  @ViewChild('sC') sC!: ElementRef<HTMLInputElement>;

  @ViewChild('segA') segA!: ElementRef<HTMLDivElement>;
  @ViewChild('segB') segB!: ElementRef<HTMLDivElement>;
  @ViewChild('segC') segC!: ElementRef<HTMLDivElement>;

  @ViewChild('valA') valA!: ElementRef<HTMLSpanElement>;
  @ViewChild('valB') valB!: ElementRef<HTMLSpanElement>;
  @ViewChild('valC') valC!: ElementRef<HTMLSpanElement>;

  @ViewChild('speedSlider') speedSlider!: ElementRef<HTMLInputElement>;

  configuracion = {
    TrabajoID: '',
    Resultados: 0,
    Grappling: 0,
    LongitudMin: 0,
    EspacioAngulos: 0,
    LongitudMinAgujeros: 0,
    LongitudAgarre: 0,
    AnchoSierra: 0,
    RotarAnidar: 0,
    NoCorteInicio: [0, 0],
    NoCorteMedio: [0, 0],
    NoCorteFinal: [0, 0],
  };

  configform: FormGroup;

  loteSeleccionado: any;
  proyectoSeleccionado: any;
  constructor(
    private form: FormBuilder,
    private configService: ApiConfiguracionService,
    private loteService: ApiLotesService,
    private proyectoService: ApiProyectosService
  ) {
    this.configform = this.form.group({
      resultados: [100, [Validators.required, Validators.min(0)]],
      grappling: [true, [Validators.required]],
      longitudMin: [1000, [Validators.required, Validators.min(0)]],
      espacioAngulos: [500, [Validators.required, Validators.min(0)]],
      longitudMinAgujeros: [500, [Validators.required, Validators.min(0)]],
      longitudAgarre: [1000, [Validators.required, Validators.min(0)]],
      anchoSierra: [3, [Validators.required, Validators.min(0)]],
      rotarAnidar: [false, [Validators.required]],

      inicioPorcentaje: [0, [Validators.required, Validators.min(0)]],
      mitadPorcentaje: [0, [Validators.required, Validators.min(0)]],
      finalPorcentaje: [0, [Validators.required, Validators.min(0)]],

      inicioMinimoMM: [0, [Validators.required, Validators.min(0)]],
      mitadMinimoMM: [0, [Validators.required, Validators.min(0)]],
      finalMinimoMM: [0, [Validators.required, Validators.min(0)]],
    });

    this.proyectoService
      .getProyectoSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((proyecto) => {
        this.proyectoSeleccionado = proyecto;
      console.log(proyecto);
      
      });

    this.loteService
      .getLoteSeleccionado()
      .pipe(takeUntil(this.subscription))
      .subscribe((lote) => {
        this.loteSeleccionado = lote;
        console.log(lote);
        
      });
  }

  ngAfterViewInit(): void {
    this.tintSpeed();
    this.updateBounds();
    this.clampToBounds();
    this.render();
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.subscription.complete();
  }

  saveConfiguracion() {
    if (this.configform.valid) {
      this.configuracion = {
        TrabajoID: this.loteSeleccionado._id,
        Resultados: this.configform.get('resultados')?.value,
        Grappling: this.configform.get('grappling')?.value,
        LongitudMin: this.configform.get('longitudMin')?.value,
        EspacioAngulos: this.configform.get('espacioAngulos')?.value,
        LongitudMinAgujeros: this.configform.get('longitudMinAgujeros')?.value,
        LongitudAgarre: this.configform.get('longitudAgarre')?.value,
        AnchoSierra: this.configform.get('anchoSierra')?.value,
        RotarAnidar: this.configform.get('rotarAnidar')?.value,
        NoCorteInicio: [
          this.configform.get('inicioMinimoMM')?.value,
          this.configform.get('inicioPorcentaje')?.value,
        ],
        NoCorteMedio: [
          this.configform.get('mitadMinimoMM')?.value,
          this.configform.get('mitadPorcentaje')?.value,
        ],
        NoCorteFinal: [
          this.configform.get('finalMinimoMM')?.value,
          this.configform.get('finalPorcentaje')?.value,
        ],
      };
      console.log(this.configuracion);
      
      this.configService
        .addConfiguracion(this.configuracion, this.loteSeleccionado._id)
        .subscribe((r) => {
          console.log(r);
        });
    }
  }

  tintSpeed(): void {
    const slider = this.speedSlider.nativeElement;
    const v = +slider.value;
    slider.style.background = `linear-gradient(90deg,#93c5fd ${v}%, #e5e7eb ${v}%)`;
  }

  clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
  }

  lateralLimit(): number {
    return Math.max(0, 50 - Number(this.sB.nativeElement.value) / 2);
  }

  updateBounds(): void {
    const b = this.lateralLimit();
    this.sA.nativeElement.max = b.toString();
    this.sC.nativeElement.max = b.toString();
  }

  clampToBounds(): void {
    const b = this.lateralLimit();
    if (+this.sA.nativeElement.value > b)
      this.sA.nativeElement.value = b.toString();
    if (+this.sC.nativeElement.value > b)
      this.sC.nativeElement.value = b.toString();
  }

  onSliderInput(): void {
    this.updateBounds();
    this.clampToBounds();
    this.render();
  }

  render(): void {
    const L = +this.sA.nativeElement.value;
    const M = +this.sB.nativeElement.value;
    const R = +this.sC.nativeElement.value;

    const minB = +this.sB.nativeElement.min || 0;
    const maxB = +this.sB.nativeElement.max || 100;
    const centerB = (minB + maxB) / 2;

    const diffB = Math.abs(M - centerB);
    const diffBPercent = maxB - minB === 0 ? 0 : (diffB / (maxB - minB)) * 100;
    const halfB = Math.min(diffBPercent, 50);

    // Segmentos visuales
    this.segA.nativeElement.style.left = '0%';
    this.segA.nativeElement.style.width = `${L}%`;

    if (halfB === 0) {
      this.segB.nativeElement.style.width = '50%';
    } else {
      const leftOff = 50 - halfB;
      this.segB.nativeElement.style.left = `${leftOff}%`;
      this.segB.nativeElement.style.width = `${halfB * 2}%`;
    }

    this.segC.nativeElement.style.right = '0%';
    this.segC.nativeElement.style.width = `${R}%`;

    // Leyendas
    this.valA.nativeElement.textContent = `${L}%`;
    this.valB.nativeElement.textContent =
      halfB === 0 ? '0%' : `${(halfB * 2).toFixed(1)}%`;
    this.valC.nativeElement.textContent = `${R}%`;

    // Fondos dinámicos (opcional)
    const b = this.lateralLimit();
    const percentA = b ? (L / b) * 100 : 0;
    const percentC = b ? (R / b) * 100 : 0;

    this.sA.nativeElement.style.background = `linear-gradient(90deg,#EE662267 ${percentA}%, #e5e7eb ${percentA}%)`;
    this.sC.nativeElement.style.background = `linear-gradient(90deg,#F8A16667 ${percentC}%, #e5e7eb ${percentC}%)`;

    this.sB.nativeElement.style.background =
      halfB === 0
        ? '#e5e7eb'
        : `linear-gradient(90deg,#e5e7eb 0%,#e5e7eb ${50 - halfB}%,#03283867 ${
            50 - halfB
          }%,#03283867 ${50 + halfB}%,#e5e7eb ${50 + halfB}%,#e5e7eb 100%)`;
  }
}
