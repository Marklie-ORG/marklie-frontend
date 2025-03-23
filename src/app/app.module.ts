import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './pages/landing/landing.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { FormsModule } from '@angular/forms';
import { ReportComponent } from './pages/report/report.component';
import { HeaderComponent } from './components/header/header.component';
import { PdfReportComponent } from './pages/pdf-report/pdf-report.component';
import { LoginComponent } from './pages/login/login.component';
// import { HomeComponent } from './pages/home/home.component';
import { FbLoginCallbackComponent } from './pages/fb-login-callback/fb-login-callback.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { AddClientModalComponent } from './components/add-client-modal/add-client-modal.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientComponent } from './pages/client/client.component';
import { EditReportComponent } from './pages/edit-report/edit-report.component';

// Register Swiper custom elements
register();

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    SignUpComponent,
    ReportComponent,
    HeaderComponent,
    PdfReportComponent,
    LoginComponent,
    // HomeComponent,
    FbLoginCallbackComponent,
    DashboardHeaderComponent,
    AddClientModalComponent,
    DashboardComponent,
    ClientComponent,
    EditReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
