import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NoticiasService, Noticia } from '../../services/noticias.service';

@Component({ 
  selector: 'app-panel', 
  imports: [FormsModule, RouterLink], 
  templateUrl: './panel.html' 
})
export class PanelComponent {
    private readonly service = inject(NoticiasService); 
    readonly isAuthenticated = signal(this.hasSession()); 
    readonly favorites = signal<Noticia[]>([]); 
    readonly status = signal(''); 
    readonly lastCreatedNews = signal<Noticia | null>(null); // Signal para guardar la noticia creada

    title = ''; category = ''; excerpt = ''; content = ''; author = ''; image = ''; caption = ''; quote = '';

    constructor() { this.service.getNoticias().subscribe(() => this.refresh()); }

    refresh() { this.favorites.set(this.isAuthenticated() ? this.service.getFavoritos() : []); }

    remove(id: string) { 
      if (!this.isAuthenticated()) return; 
      this.service.eliminarFavorito(id); 
      this.refresh(); 
    }

    async onImageSelected(event: Event) { 
      const input = event.target as HTMLInputElement; 
      const file = input.files?.[0]; 
      if (!file) { this.image = ''; return; } 
      if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { 
        input.setCustomValidity(file.size > 2 * 1024 * 1024 ? 'La imagen debe pesar máximo 2 MB.' : 'Selecciona un archivo de imagen válido.'); 
        input.reportValidity(); 
        this.image = ''; 
        return; 
      } 
      input.setCustomValidity(''); 
      this.image = await this.readImage(file); 
    }

    publish(event: Event) { 
      event.preventDefault();

      if (!this.isAuthenticated()) { 
        this.status.set('Inicia sesión para publicar noticias.'); 
        this.lastCreatedNews.set(null);
        return; 
      } 

      const formElement = event.target as HTMLFormElement;

      // Si no cumple la validación HTML5 o no hay imagen, reporta los mensajes flotantes
      if (!formElement.checkValidity() || !this.image) {
        formElement.reportValidity();
        return;
      }

      // Guardamos la noticia y obtenemos la respuesta con su ID generado
      const nuevaNoticia = this.service.agregarNoticia({ 
        title: this.title.trim(), 
        category: this.category, 
        excerpt: this.excerpt.trim(), 
        content: this.content.trim(), 
        quote: this.quote.trim(), 
        image: this.image, 
        caption: this.caption.trim(), 
        author: this.author.trim() 
      }); 

      this.status.set('Noticia guardada correctamente.'); 
      this.lastCreatedNews.set(nuevaNoticia); // Almacenamos la noticia creada

      // Reset de campos
      formElement.reset(); 
      this.title = this.category = this.excerpt = this.content = this.author = this.image = this.caption = this.quote = ''; 
    }

    private readImage(file: File): Promise<string> { 
      return new Promise((resolve, reject) => { 
        const reader = new FileReader(); 
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No se pudo leer la imagen.')); 
        reader.onerror = () => reject(new Error('No se pudo leer la imagen.')); 
        reader.readAsDataURL(file); 
      }); 
    }

    private hasSession() { 
      try { return Boolean(localStorage.getItem('diario_user')); } catch { return false; } 
    }
}