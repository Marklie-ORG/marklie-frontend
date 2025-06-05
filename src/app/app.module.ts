import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './pages/landing/landing.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FbLoginCallbackComponent } from './pages/fb-login-callback/fb-login-callback.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientComponent } from './pages/client/client.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AddClientComponent } from './components/add-client/add-client.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { SlackLoginCallbackComponent } from './pages/slack-login-callback/slack-login-callback.component';
import { MetricSelectorComponent } from "./components/metrics/metrics-selector/metric-selector.component";
import { KpiViewerComponent } from "./components/metrics/kpis/kpi-viewer.component";
import { ScheduleReportComponent } from "./pages/schedule-report/schedule-report.component.js";
import { FaIconComponent, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgSelectModule } from "@ng-select/ng-select";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ClientSettingsComponent } from './components/client-settings/client-settings.component';
import { ModalBaseComponent } from './components/modal-base/modal-base.component';
import {ReportComponent} from "./pages/report/report.component.js";
import {PdfReportComponent} from "./pages/pdf-report/pdf-report.component.js";
import {LoginComponent} from "./components/login/login.component.js";
import {RegisterComponent} from "./components/register/register.component.js";
import {AuthDialogComponent} from "./components/auth-dialog/auth-dialog.component.js";
import { ProfileComponent } from './pages/profile/profile.component';
import { VerifyEmailChangeComponent } from './pages/verify-email-change/verify-email-change.component';
import { ForgotPasswordEmailFormComponent } from './components/forgot-password-email-form/forgot-password-email-form.component';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery.component';

import { OnboardingComponent } from './pages/onboarding/onboarding.component';
import { NotificationComponent } from './components/notification/notification.component';
import { AuthComponent } from './pages/auth/auth.component';
import { EditReportComponent } from './pages/edit-report/edit-report.component';
import { ScheduleOptionsComponent } from './components/schedule-options/schedule-options.component';
import { EditReportTmpComponent } from './components/edit-report-tmp/edit-report-tmp.component';
import { EditMetricsTmpComponent } from './components/edit-metrics-tmp/edit-metrics-tmp.component';

register();

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HeaderComponent,
    FbLoginCallbackComponent,
    DashboardHeaderComponent,
    DashboardComponent,
    ClientComponent,
    AddClientComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    SlackLoginCallbackComponent,
    MetricSelectorComponent,
    KpiViewerComponent,
    ScheduleReportComponent,
    SlackLoginCallbackComponent,
    ClientSettingsComponent,
    ModalBaseComponent,
    SlackLoginCallbackComponent,
    ClientSettingsComponent,
    ReportComponent,
    PdfReportComponent,
    OnboardingComponent,
    
    LoginComponent,
    RegisterComponent,
    AuthDialogComponent,
    ForgotPasswordEmailFormComponent,
    

    ProfileComponent,
    VerifyEmailChangeComponent,
    ForgotPasswordEmailFormComponent,
    PasswordRecoveryComponent,
    NotificationComponent,
    AuthComponent,
    EditReportComponent,
    ScheduleOptionsComponent,
    EditReportTmpComponent,
    EditMetricsTmpComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    ReactiveFormsModule,
    DragDropModule,
    NgSelectModule,
    BrowserAnimationsModule,
    DragDropModule,
    FaIconComponent,
    FontAwesomeModule

  ],
  providers: [
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
