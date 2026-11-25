import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriaLista } from './categoria-lista';

describe('CategoriaLista', () => {
  let component: CategoriaLista;
  let fixture: ComponentFixture<CategoriaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaLista],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});