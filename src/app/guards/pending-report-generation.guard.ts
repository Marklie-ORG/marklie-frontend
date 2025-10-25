import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { EditReportComponent } from '../pages/edit-report/edit-report.component';

@Injectable({ providedIn: 'root' })
export class PendingReportGenerationGuard implements CanDeactivate<EditReportComponent> {
  canDeactivate(component: EditReportComponent): boolean {
    if (component.isReportGenerationInProgress()) {
      return confirm('Are you sure you want to leave the page? Your report is still getting generated.');
    }

    return true;
  }
}
