import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import { NoticiasService } from '../../services/noticias.service';
interface HeaderUser { nombre:string }
@Component({selector:'app-header',imports:[RouterLink,FormsModule,DatePipe],templateUrl:'./header.html',styleUrl:'./header.css'})
export class HeaderComponent implements OnInit,OnDestroy {
 private readonly router=inject(Router);private readonly service=inject(NoticiasService);private timer?:ReturnType<typeof setInterval>;private navigationSubscription?:Subscription;
 readonly now=signal(new Date());readonly categories=[{label:'Todos',value:'todos'},{label:'Tecnología',value:'tecnologia'},{label:'Economía',value:'economia'},{label:'Turismo',value:'turismo'},{label:'Cultura',value:'cultura'},{label:'Educación',value:'educacion'}];readonly selectedCategory=signal('todos');readonly results=this.service.noticias;readonly usuario=signal<HeaderUser|null>(null);readonly avatarUrl=computed(()=>{const name=this.usuario()?.nombre;return name?`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=B8282B&color=fff`:'';});query='';
 private readonly authChange=()=>this.syncUser();private readonly storageChange=(event:StorageEvent)=>{if(event.key===null||event.key==='diario_user')this.syncUser();};
 ngOnInit():void{this.service.getNoticias().subscribe();this.syncUser();window.addEventListener('authchange',this.authChange);window.addEventListener('storage',this.storageChange);this.readRouteFilters();this.navigationSubscription=this.router.events.pipe(filter((event):event is NavigationEnd=>event instanceof NavigationEnd)).subscribe(()=>this.readRouteFilters());this.timer=setInterval(()=>this.now.set(new Date()),1000);}
 get matches(){const q=this.normalize(this.query);return q?this.results().filter(n=>this.normalize(`${n.title} ${n.category} ${n.excerpt}`).includes(q)).slice(0,5):[];}
 chooseCategory(category:string){this.selectedCategory.set(category);void this.router.navigate(['/listado'],{queryParams:{categoria:category,q:this.query.trim()||null},replaceUrl:true});}
 searchChanged(value:string){this.query=value;const page=this.router.url.split(/[?#]/)[0];const destination=page==='/'||page==='/listado'?page:'/listado';void this.router.navigate([destination],{queryParams:{categoria:this.selectedCategory()==='todos'?null:this.selectedCategory(),q:value.trim()||null},replaceUrl:true});}
 go(id:string){this.query='';void this.router.navigate(['/detalle',id]);}
 private syncUser(){try{const raw=localStorage.getItem('diario_user');if(!raw){this.usuario.set(null);return;}const parsed:unknown=JSON.parse(raw);if(typeof parsed==='string'){this.usuario.set(parsed.trim()?{nombre:parsed.trim()}:null);return;}if(parsed&&typeof parsed==='object'){const value=parsed as {nombre?:unknown;name?:unknown};const name=typeof value.nombre==='string'?value.nombre:value.name;this.usuario.set(typeof name==='string'&&name.trim()?{nombre:name.trim()}:null);return;}this.usuario.set(null);}catch{this.usuario.set(null);}}
 private readRouteFilters(){const params=this.router.parseUrl(this.router.url).queryParams;const category=this.normalize(params['categoria']??'todos');this.selectedCategory.set(this.categories.some(item=>item.value===category)?category:'todos');this.query=params['q']??'';}
 private normalize(value:string){return value.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
 ngOnDestroy(){this.navigationSubscription?.unsubscribe();if(this.timer)clearInterval(this.timer);window.removeEventListener('authchange',this.authChange);window.removeEventListener('storage',this.storageChange);}
}
