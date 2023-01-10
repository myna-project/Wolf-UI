import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatDateAdapter, NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { NgxMatMomentModule, NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ChartModule } from 'angular-highcharts';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

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

import { PendingChangesGuard } from './_guards/pending-changes.guard';

import { ConfirmDialogComponent } from './_utils/confirm-dialog/confirm-dialog.component';
import { DrainsTreeDialogComponent } from './_utils/drains-tree-dialog/drains-tree-dialog.component';
import { CustomHttpInterceptor } from './_utils/http.interceptor';
import { MessageDialogComponent } from './_utils/message-dialog/message-dialog.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    ActivationComponent,
    CloudPluginComponent,
    ConfigMenuComponent,
    ConfirmDialogComponent,
    DashboardComponent,
    DrainsTreeDialogComponent,
    FieldPluginComponent,
    LoginComponent,
    MeasuresComponent,
    MessageDialogComponent,
    NetConfigComponent,
    RegmapsComponent,
    RegmapsListComponent,
    SectionsComponent,
    WolfConfigComponent
  ],
  entryComponents: [
    ConfirmDialogComponent,
    DrainsTreeDialogComponent,
    MessageDialogComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ChartModule,
    CommonModule,
    CodemirrorModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    MatMomentDateModule,
    NgxMatFileInputModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
    PendingChangesGuard
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
