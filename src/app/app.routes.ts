import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { ListadoComponent } from './components/listado/listado';
import { DetalleComponent } from './components/detalle/detalle';
import { ContactoComponent } from './components/contacto/contacto';
import { PanelComponent } from './components/panel/panel';
import { CuentaComponent } from './components/cuenta/cuenta';
export const routes: Routes = [
 {path:'',component:HomeComponent,title:'Inicio | El Diario Digital'},
 {path:'listado',component:ListadoComponent,title:'Catálogo de Noticias'},
 {path:'detalle/:id',component:DetalleComponent,title:'Detalle de noticia'},
 {path:'contacto',component:ContactoComponent,title:'Contacto'},
 {path:'cuenta',component:CuentaComponent,title:'Tu cuenta'},
 {path:'panel',component:PanelComponent,title:'Panel de gestión'},
 {path:'**',redirectTo:''}
];
