import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActivationComponent } from './activation/activation.component';
import { CloudPluginComponent } from './cloud-plugin/cloud-plugin.component';
import { ConfigMenuComponent } from './configmenu/configmenu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FieldPluginComponent } from './field-plugin/field-plugin.component';
import { LoginComponent } from './login/login.component';
import { MeasuresComponent } from './measures/measures.component';
import { NetConfigComponent } from './netconfig/netconfig.component';
import { RegmapsComponent } from './regmaps/regmaps-detail/regmaps.component';
import { RegmapsListComponent } from './regmaps/regmaps-list/regmaps-list.component';
import { SectionsComponent } from './sections/sections.component';
import { WolfConfigComponent } from './wolfconfig/wolfconfig.component';

import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path:'activation',
    component: ActivationComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'cloud-plugin',
    component: CloudPluginComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'configmenu',
    component: ConfigMenuComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'field-plugin',
    component: FieldPluginComponent
  },
  {
    path: 'measures',
    component: MeasuresComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'netconfig',
    component: NetConfigComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'regmaps-list',
    component: RegmapsListComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'regmaps',
    component: RegmapsComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'regmaps/:map',
    component: RegmapsComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'section/:pluginType/:plugin',
    component: SectionsComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'section/:pluginType/:plugin/:section',
    component: SectionsComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'wolfconfig',
    component: WolfConfigComponent,
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
