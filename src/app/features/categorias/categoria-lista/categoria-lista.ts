import { Component, OnInit, signal, computed } from '@angular/core';
import { CategoriaForm } from '../categoria-form/categoria-form';
import { Categoria, CategoriaInput } from '../../../models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { mensagemErroHttp } from '../../../core/utils/http-erro.util';

@Component({
  imports: [CategoriaForm],
  selector: 'app-categoria-lista',
  styleUrl: './categoria-lista.css',
  templateUrl: './categoria-lista.html',
})
export class CategoriaLista implements OnInit {
  categorias = signal<Categoria[]>([]);
  erro = "";
  carregado = false;
  filtroTipo = signal<'TODOS' | 'RECEITA' | 'DESPESA'>('TODOS');
  categoriaSelecionada: Categoria | null = null;

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.carregado = true;
    this.erro = "";
    this.categoriaService.listar().subscribe({
      next: dados => {
        this.categorias.set(dados);
        this.carregado = false;
      },
      error: erro => {
        this.carregado = false;
        this.erro = mensagemErroHttp(erro, 'Falha ao carregar categorias');
      }
    })
  }

  editar(categoria: Categoria): void {
    this.categoriaSelecionada = { ...categoria };
  }

  aoSalvar(): void {
    this.categoriaSelecionada = null;
    this.carregarCategorias();
  }

  aoCancelar(): void {
    this.categoriaSelecionada = null;
  }

  alterarSituacao(categoria: Categoria): void {
    const dados: CategoriaInput = {
      descricao: categoria.descricao,
      tipo: categoria.tipo,
      ativa: !categoria.ativa
    }
    this.categoriaService
      .atualizar(categoria.id,dados)
      .subscribe({
        next: ()=>this.carregarCategorias(),
        error: erro => {
          this.erro = mensagemErroHttp(erro, 'Não foi possível atualizar a situação.');
          console.error(erro);
        }
      });
  }

  categoriasFiltradas = computed(() => {
    const tipo = this.filtroTipo();

    if (tipo === 'TODOS') {
      return this.categorias();
    }

    return this.categorias().filter(
      categoria => categoria.tipo === tipo
    );
  });
  
  alterarFiltro(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroTipo.set(
      select.value as 'TODOS' | 'RECEITA' | 'DESPESA'
    );
  }

}