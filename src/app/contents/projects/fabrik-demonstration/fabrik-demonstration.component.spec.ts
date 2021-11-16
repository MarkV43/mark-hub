import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FabrikDemonstrationComponent } from './fabrik-demonstration.component';

describe('FabrikDemonstrationComponent', () => {
  let component: FabrikDemonstrationComponent;
  let fixture: ComponentFixture<FabrikDemonstrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FabrikDemonstrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FabrikDemonstrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
