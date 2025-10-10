import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaAnalisisComponent } from './tabla-analisis.component';

describe('TablaAnalisisComponent', () => {
  let component: TablaAnalisisComponent;
  let fixture: ComponentFixture<TablaAnalisisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaAnalisisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaAnalisisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
