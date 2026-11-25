import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LancamentoForm } from './lancamento-form';

describe('LancamentoForm', () => {
  let component: LancamentoForm;
  let fixture: ComponentFixture<LancamentoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LancamentoForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LancamentoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
