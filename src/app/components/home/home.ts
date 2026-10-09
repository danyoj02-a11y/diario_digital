import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiasService, Noticia } from '../../services/noticias.service';
interface NewsletterSubscriber { email:string; subscribedAt:string }
@Component({selector:'app-home',imports:[RouterLink,DatePipe,FormsModule],templateUrl:'./home.html'})
export class HomeComponent {
 private readonly service=inject(NoticiasService);private readonly route=inject(ActivatedRoute);
 readonly noticias=signal<Noticia[]>([]);private category='todos';private query='';
 newsletterEmail='';newsletterStatus='';
 constructor(){this.service.getNoticias().subscribe(items=>this.noticias.set(items));this.route.queryParamMap.subscribe(params=>{this.category=(params.get('categoria')??'todos').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();this.query=(params.get('q')??'').toLowerCase();});}
 private get filtered(){return this.noticias().filter(n=>(this.category==='todos'||n.category.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()===this.category)&&`${n.title} ${n.excerpt} ${n.category}`.toLowerCase().includes(this.query));}
 get destacadas(){return this.filtered.slice(1,4)}get principal(){return this.filtered[0]}
 subscribeNewsletter(event:Event){
  event.preventDefault();const email=this.newsletterEmail.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){this.newsletterStatus='Escribe un correo electrónico válido.';return;}
  let subscribers:NewsletterSubscriber[]=[];try{subscribers=JSON.parse(localStorage.getItem('diario_digital_newsletter')??'[]') as NewsletterSubscriber[];}catch{subscribers=[];}
  if(subscribers.some(subscriber=>subscriber.email===email)){this.newsletterStatus='Este correo ya está suscrito.';return;}
  subscribers.push({email,subscribedAt:new Date().toISOString()});localStorage.setItem('diario_digital_newsletter',JSON.stringify(subscribers));
  this.newsletterEmail='';this.newsletterStatus='¡Gracias! Te has suscrito al resumen semanal.';
 }
}
