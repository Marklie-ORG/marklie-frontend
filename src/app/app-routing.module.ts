import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';
// import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ReportComponent } from './pages/report/report.component';
import { PdfReportComponent } from './pages/pdf-report/pdf-report.component';
import { LoginComponent } from './pages/login/login.component';
// import { HomeComponent } from './pages/home/home.component';
import { FbLoginCallbackComponent } from './pages/fb-login-callback/fb-login-callback.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientComponent } from './pages/client/client.component';
import { EditReportComponent } from './pages/edit-report/edit-report.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    // canActivate: [authGuard]
  },
  // {
  //   path: 'sign-up',
  //   component: SignUpComponent
  // },
  {
    path: 'login',
    component: LoginComponent
  },
  // {
  //   path: 'home',
  //   component: HomeComponent
  // },
  {
    path: 'report',
    component: ReportComponent
  },
  {
    path: 'report/:id',
    component: ReportComponent
  },
  {
    path: 'pdf-report/:id',
    component: PdfReportComponent
  },
  {
    path: 'fb-login-callback',
    component: FbLoginCallbackComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'client/:id',
    component: ClientComponent
  },
  {
    path: 'client/:clientId/report/:id',
    component: EditReportComponent
  },
  // {
  //   path: 'client/:clientId/report/new',
  //   component: EditReportComponent
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
