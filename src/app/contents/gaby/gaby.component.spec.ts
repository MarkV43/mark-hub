import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GabyComponent } from './gaby.component';

describe('GabyComponent', () => {
  let component: GabyComponent;
  let fixture: ComponentFixture<GabyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GabyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GabyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
