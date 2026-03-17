import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarMembresia } from './cambiar-membresia';

describe('CambiarMembresia', () => {
  let component: CambiarMembresia;
  let fixture: ComponentFixture<CambiarMembresia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarMembresia],
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarMembresia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
