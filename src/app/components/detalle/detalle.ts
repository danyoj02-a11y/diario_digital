import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NoticiasService, Noticia } from '../../services/noticias.service';
@Component({ selector: 'app-detalle', imports: [RouterLink, DatePipe], templateUrl: './detalle.html' })
export class DetalleComponent {
    private readonly route = inject(ActivatedRoute); private readonly service = inject(NoticiasService);
    readonly noticia = signal<Noticia | undefined>(undefined); readonly favorite = signal(false); readonly favoriteMessage = signal('');
    constructor() { this.route.paramMap.subscribe(params => { const id = params.get('id') ?? ''; this.service.getNoticiaById(id).subscribe(item => { this.noticia.set(item); this.favorite.set(item ? this.service.esFavorito(item.id) : false); this.favoriteMessage.set(''); }); }); }
    toggle() { const item = this.noticia(); if (!item) return; const activeUser = localStorage.getItem('diario_user'); if (!activeUser) { this.favoriteMessage.set('Inicia sesión para guardar noticias en favoritos.'); return; } this.favorite.set(this.service.toggleFavorito(item.id)); this.favoriteMessage.set(''); }
}
