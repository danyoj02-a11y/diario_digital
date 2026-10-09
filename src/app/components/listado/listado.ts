import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NoticiasService, Noticia } from '../../services/noticias.service';
@Component({ selector: 'app-listado', imports: [RouterLink, FormsModule, DatePipe], templateUrl: './listado.html', styleUrl: './listado.css' })
export class ListadoComponent {
    private readonly service = inject(NoticiasService); private readonly route = inject(ActivatedRoute);
    readonly noticias = signal<Noticia[]>([]); categoria = signal('todos'); busqueda = signal('');
    readonly categorias = computed(() => ['Todos', ...new Set(this.noticias().map(n => n.category))]);
    readonly filtradas = computed(() => this.noticias().filter(n => (this.categoria() === 'todos' || this.normalize(n.category) === this.categoria()) && this.normalize(`${n.title} ${n.excerpt} ${n.category}`).includes(this.normalize(this.busqueda()))));
    constructor() { this.service.getNoticias().subscribe(x => this.noticias.set(x)); this.route.queryParamMap.subscribe(params => { this.categoria.set(this.normalize(params.get('categoria') ?? 'todos')); this.busqueda.set(params.get('q') ?? ''); }); }
    private normalize(value: string) { return value.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
}
