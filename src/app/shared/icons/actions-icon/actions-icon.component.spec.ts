import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsIconComponent } from './actions-icon.component';

describe('ActionsIconComponent', () => {
  let component: ActionsIconComponent;
  let fixture: ComponentFixture<ActionsIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionsIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
