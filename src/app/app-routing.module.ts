import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LandingNewComponent } from './pages/landing-new/landing-new.component';
import { FbLoginCallbackComponent } from './pages/fb-login-callback/fb-login-callback.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientComponent } from './pages/client/client.component';
import { OnboardingComponent } from './pages/onboarding/onboarding.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { SlackLoginCallbackComponent } from './pages/slack-login-callback/slack-login-callback.component';
import { ScheduleReportComponent } from './pages/schedule-report/schedule-report.component.js';
import { ViewReportComponent } from './pages/view-report/view-report.component.js';
import { PdfReportComponent } from './pages/pdf-report/pdf-report.component.js';
import { ProfileComponent } from './pages/profile/profile.component';
import { VerifyEmailChangeComponent } from './pages/verify-email-change/verify-email-change.component';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery.component';
import { AuthComponent } from './pages/auth/auth.component';
import { EditReportComponent } from './pages/edit-report/edit-report.component';
import { ReviewReportComponent } from './pages/review-report/review-report.component';
import { ReportsPageComponent } from './pages/reports/reports-page.component.js';
import { ReportsDatabasePageComponent } from './pages/reports-database/reports-database-page.component';
import { BillingComponent } from './pages/billing/billing.component';
const routes: Routes = [
  {
    path: '',
    component: LandingNewComponent,
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'fb-login-callback',
    component: FbLoginCallbackComponent,
    canActivate: [authGuard],
  },
  {
    path: 'slack-login-callback',
    component: SlackLoginCallbackComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'client/:id',
    component: ClientComponent,
    canActivate: [authGuard],
  },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [authGuard],
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'terms-of-service',
    component: TermsOfServiceComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'verify-email-change',
    component: VerifyEmailChangeComponent,
  },
  {
    path: 'password-recovery',
    component: PasswordRecoveryComponent,
  },
  {
    path: 'reports',
    component: ReportsPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'reports-database',
    component: ReportsDatabasePageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'pdf-report/:reportUuid',
    component: PdfReportComponent
  },
  {
    path: 'edit-report/:clientUuid/:schedulingOptionId',
    component: EditReportComponent,
    canActivate: [authGuard],
  },
  {
    path: 'review-report/:clientUuid/:reportUuid',
    component: ReviewReportComponent,
    canActivate: [authGuard],
  },
  {
    path: 'schedule-report/:clientUuid',
    component: ScheduleReportComponent,
    canActivate: [authGuard]
  },
  {
    path: 'view-report/:clientUuid/:reportUuid',
    component: ViewReportComponent
  },
  {
    path: 'billing',
    component: BillingComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
