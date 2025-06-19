import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { FbLoginCallbackComponent } from './pages/fb-login-callback/fb-login-callback.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientComponent } from './pages/client/client.component';
import { OnboardingComponent } from './pages/onboarding/onboarding.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { SlackLoginCallbackComponent } from './pages/slack-login-callback/slack-login-callback.component';
import { ScheduleReportComponent } from "./pages/schedule-report/schedule-report.component.js";
import {ReportComponent} from "./pages/report/report.component.js";
import {PdfReportComponent} from "./pages/pdf-report/pdf-report.component.js";
import { ProfileComponent } from './pages/profile/profile.component';
import { VerifyEmailChangeComponent } from './pages/verify-email-change/verify-email-change.component';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery.component';
import { AuthComponent } from './pages/auth/auth.component';
import { EditReportComponent } from './pages/edit-report/edit-report.component';
import { EditReportContentComponent } from './components/edit-report-content/edit-report-content.component';
import { ReviewReportComponent } from './pages/review-report/review-report.component';
const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'fb-login-callback',
    component: FbLoginCallbackComponent,
    canActivate: [authGuard]
  },
  {
    path: 'slack-login-callback',
    component: SlackLoginCallbackComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'client/:id',
    component: ClientComponent,
    canActivate: [authGuard]
  },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [authGuard]
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'terms-of-service',
    component: TermsOfServiceComponent
  },
  { path: 'schedule-report/:clientUuid',
    component: ScheduleReportComponent,
    canActivate: [authGuard]

  },
  { path: 'view-report/:uuid',
    component: ReportComponent
  },
  { path: 'pdf-report/:uuid',
    component: PdfReportComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  { path: 'verify-email-change',
    component: VerifyEmailChangeComponent
  },
  { path: 'password-recovery',
    component: PasswordRecoveryComponent
  },
  { path: 'view-report/:uuid',
    component: ReportComponent
  },
  { path: 'pdf-report/:uuid',
    component: PdfReportComponent
  },
  {
    path: 'edit-report/:schedulingOptionId',
    component: EditReportComponent, 
    canActivate: [authGuard]
  },
  {
    path: 'review-report/:id',
    component: ReviewReportComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
