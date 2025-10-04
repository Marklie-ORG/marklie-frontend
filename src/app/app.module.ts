import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { register } from "swiper/element/bundle";
import { MatDialogModule } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LandingComponent } from "./pages/landing/landing.component";
import { FormsModule } from "@angular/forms";
import { HeaderNewComponent } from "./components/header-new/header-new.component";

import { FbLoginCallbackComponent } from "./pages/fb-login-callback/fb-login-callback.component";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { DashboardHeaderComponent } from "./components/dashboard-header/dashboard-header.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { ClientComponent } from "./pages/client/client.component";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { AddClientComponent } from "./components/add-client/add-client.component";
import { PrivacyPolicyComponent } from "./pages/privacy-policy/privacy-policy.component";
import { TermsOfServiceComponent } from "./pages/terms-of-service/terms-of-service.component";
import { SlackLoginCallbackComponent } from "./pages/slack-login-callback/slack-login-callback.component";
import { ScheduleReportComponent } from "./pages/schedule-report/schedule-report.component.js";
import {
  FaIconComponent,
  FontAwesomeModule
} from "@fortawesome/angular-fontawesome";
import { NgSelectModule } from "@ng-select/ng-select";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ClientSettingsComponent } from "./components/client-settings/client-settings.component";
import { ModalBaseComponent } from "./components/modal-base/modal-base.component";
import { ViewReportComponent } from "./pages/view-report/view-report.component.js";
import { PdfReportComponent } from "./pages/pdf-report/pdf-report.component.js";
import { LoginComponent } from "./components/login/login.component.js";
import { RegisterComponent } from "./components/register/register.component.js";
import { AuthDialogComponent } from "./components/auth-dialog/auth-dialog.component.js";
import { ProfileComponent } from "./pages/profile/profile.component";
import { VerifyEmailChangeComponent } from "./pages/verify-email-change/verify-email-change.component";
import { ForgotPasswordEmailFormComponent } from "./components/forgot-password-email-form/forgot-password-email-form.component";
import { PasswordRecoveryComponent } from "./pages/password-recovery/password-recovery.component";

import { OnboardingComponent } from "./pages/onboarding/onboarding.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { AuthComponent } from "./pages/auth/auth.component";
import { EditReportComponent } from "./pages/edit-report/edit-report.component";
import { ScheduleOptionsComponent } from "./components/schedule-options/schedule-options.component";
import { ReportComponent } from "./components/report/report.component";
import { EditMetricsComponent } from "./components/edit-metrics/edit-metrics.component";
import { ReviewReportComponent } from "./pages/review-report/review-report.component";
import { KpiGridComponent } from "./components/kpi-grid/kpi-grid.component";
import { AdCardComponent } from "./components/ad-card/ad-card.component";
import { CampaignTableComponent } from "./components/campaign-table/campaign-table.component";
import { ChartsComponent } from "./components/charts/charts.component";
import { ActivityTableComponent } from "./components/activity-logs-card/activity-table.component";
import { ScheduledReportsPageComponent } from "./pages/scheduled-reports/scheduled-reports-page.component.js";
import { ItemComponent } from "./components/edit-metrics/components/item/item.component";
import { WhatsappMessagePreviewComponent } from "./components/whatsapp-message-preview/whatsapp-message-preview.component";
import { ImagesManagerComponent } from "./components/images-manager/images-manager.component";
import { ReportHeaderComponent } from "./components/report-header/report-header.component";
import { LandingNewComponent } from "./pages/landing-new/landing-new.component";
import {HeaderComponent} from "./components/header/header.component.js";
import { CommunicationsSettingsComponent } from './components/communications-settings/communications-settings.component';
import { AdAccountsSettingsComponent } from './components/ad-accounts-settings/ad-accounts-settings.component';
import { CustomMetricBuilderComponent } from './components/custom-metric-builder/custom-metric-builder.component';

import { SuggestedFeaturesComponent } from './pages/suggested-features/suggested-features.component';
import { FeatureSuggestionComponent } from './pages/feature-suggestion/feature-suggestion.component';

import { PhoneInputComponent } from './components/phone-input/phone-input.component';
import { DatabaseTableComponent } from './components/database-table/database-table.component';
import { ReportsDatabasePageComponent } from './pages/reports-database/reports-database-page.component';
import { ReportsDatabaseListComponent } from './components/reports-database-list/reports-database-list.component';
import { BillingComponent } from './pages/billing/billing.component';
import { MessagesAccordionComponent } from "./components/messages-accordion/messages-accordion.component";
import { PlansCompareComponent } from './components/plans-compare/plans-compare.component';
import { ConfirmDialogComponent } from "./components/confirm-dialog/confirm-dialog.component";
import { FinishReviewDialogComponent } from './components/finish-review-dialog/finish-review-dialog.component';
import { MetricsActionsMenuComponent } from './components/metrics-actions-menu/metrics-actions-menu.component';
import { LoomEmbedComponent } from './components/loom-embed/loom-embed.component';
import { LoomLinkEditorComponent } from './components/loom-link-editor/loom-link-editor.component';
import {CheckoutComponent} from "./pages/billing/checkout/checkout.component.js";
import {CompleteComponent} from "./pages/billing/complete/complete.component.js";
import { ClientDatabaseComponent } from './pages/client-database/client-database.component';
import { ShareClientDatabaseComponent } from './components/share-client-database/share-client-database.component';
import { ActivateClientAccessComponent } from './pages/activate-client-access/activate-client-access.component';


register();

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    FbLoginCallbackComponent,
    DashboardHeaderComponent,
    DashboardComponent,
    ClientComponent,
    AddClientComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    SlackLoginCallbackComponent,
    ScheduleReportComponent,
    SlackLoginCallbackComponent,
    ClientSettingsComponent,
    ModalBaseComponent,
    SlackLoginCallbackComponent,
    ClientSettingsComponent,
    ViewReportComponent,
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
    ReportComponent,
    EditMetricsComponent,
    ReviewReportComponent,
    KpiGridComponent,
    AdCardComponent,
    CampaignTableComponent,
    ChartsComponent,
    CheckoutComponent,
    CompleteComponent,

    ActivityTableComponent,
    ScheduledReportsPageComponent,
    ItemComponent,
    WhatsappMessagePreviewComponent,
    ImagesManagerComponent,
    ReportHeaderComponent,
    HeaderComponent,
    CommunicationsSettingsComponent,
    AdAccountsSettingsComponent,
    SuggestedFeaturesComponent,
    FeatureSuggestionComponent,

    PhoneInputComponent,
  DatabaseTableComponent,
  ReportsDatabasePageComponent,
  ReportsDatabaseListComponent,
  BillingComponent,
  MessagesAccordionComponent,
  ConfirmDialogComponent,
  FinishReviewDialogComponent,
  PlansCompareComponent,
  MetricsActionsMenuComponent,
  LoomEmbedComponent,
  LoomLinkEditorComponent,
  ClientDatabaseComponent,
  ShareClientDatabaseComponent,
  ActivateClientAccessComponent,
  CustomMetricBuilderComponent

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
    FaIconComponent,
    FontAwesomeModule,
    LandingNewComponent,
    HeaderNewComponent
  ],
  providers: [
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
