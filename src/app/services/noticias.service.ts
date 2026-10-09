import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, concat, finalize, map, of, shareReplay, tap } from 'rxjs';
export interface Noticia { id: string; title: string; category: string; excerpt: string; content: string; quote: string; image: string; detailImage?: string; caption: string; publishedAt: string; author: string; authorRole: string; authorAvatar: string; }
@Injectable({ providedIn: 'root' })
export class NoticiasService implements OnDestroy {
    private readonly http = inject(HttpClient); private readonly storageKey = 'diario_noticias'; private readonly favoriteKey = 'diario_favoritos';
    readonly noticias = signal<Noticia[]>(this.readStored()); private pendingRefresh?: Observable<Noticia[]>;
    private readonly onStorage = (event: StorageEvent): void => { if (event.key === null || event.key === this.storageKey) this.refreshNoticias().pipe(catchError(() => of(this.readStored()))).subscribe(); };
    constructor() { window.addEventListener('storage', this.onStorage); }
    getNoticias(): Observable<Noticia[]> { const cached = this.readStored(); this.noticias.set(cached); const refresh = this.refreshNoticias(); return cached.length ? concat(of(cached), refresh.pipe(catchError(() => of(cached)))) : refresh.pipe(catchError(() => { this.noticias.set([]); return of([]); })); }
    refreshNoticias(): Observable<Noticia[]> { if (this.pendingRefresh) return this.pendingRefresh; let request!: Observable<Noticia[]>; request = this.http.get<Noticia[]>(`/data/noticias.json?t=${Date.now()}`).pipe(map(remote => this.mergeLocalPublications(remote)), tap(items => { this.noticias.set(items); this.persist(items); }), finalize(() => { if (this.pendingRefresh === request) this.pendingRefresh = undefined; }), shareReplay({ bufferSize: 1, refCount: false })); this.pendingRefresh = request; return request; }
    getNoticiaById(id: string): Observable<Noticia | undefined> { return this.getNoticias().pipe(map(items => items.find(item => item.id === id))); }
    agregarNoticia(input: Omit<Noticia, 'id' | 'publishedAt' | 'authorRole' | 'authorAvatar'> & Partial<Pick<Noticia, 'authorRole' | 'authorAvatar'>>): Noticia { const item: Noticia = { ...input, id: globalThis.crypto?.randomUUID?.() ?? Date.now().toString(), publishedAt: new Date().toISOString(), authorRole: input.authorRole ?? 'Periodista | El Diario Digital', authorAvatar: input.authorAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(input.author)}&background=333&color=fff` }; const next = [item, ...this.noticias()]; this.noticias.set(next); this.persist(next); return item; }
    toggleFavorito(id: string): boolean { const ids = this.favoriteIds(); const exists = ids.includes(id); localStorage.setItem(this.favoriteKey, JSON.stringify(exists ? ids.filter(item => item !== id) : [...ids, id])); return !exists; }
    esFavorito(id: string): boolean { return this.favoriteIds().includes(id); }
    getFavoritos(): Noticia[] { const ids = this.favoriteIds(); return this.noticias().filter(item => ids.includes(item.id)); }
    eliminarFavorito(id: string): void { localStorage.setItem(this.favoriteKey, JSON.stringify(this.favoriteIds().filter(item => item !== id))); }
    ngOnDestroy(): void { window.removeEventListener('storage', this.onStorage); }
    private mergeLocalPublications(remote: Noticia[]): Noticia[] { const remoteIds = new Set(remote.map(item => item.id)); const localOnly = this.readStored().filter(item => !remoteIds.has(item.id)); return [...localOnly, ...remote]; }
    private readStored(): Noticia[] { try { return JSON.parse(localStorage.getItem(this.storageKey) ?? '[]') as Noticia[]; } catch { return []; } }
    private persist(items: Noticia[]): void { localStorage.setItem(this.storageKey, JSON.stringify(items)); }
    private favoriteIds(): string[] { try { return JSON.parse(localStorage.getItem(this.favoriteKey) ?? '[]') as string[]; } catch { return []; } }
}
