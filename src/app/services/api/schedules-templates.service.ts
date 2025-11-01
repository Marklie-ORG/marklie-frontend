import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';
import { SchedulingTemplate } from 'src/app/interfaces/templates.interfaces';

export enum TemplateOrigin {
  SYSTEM = 'system',
  USER = 'user',
}

export enum TemplateVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

@Injectable({
  providedIn: 'root',
})
export class SchedulesTemplatesService {
  private readonly apiUrl = `${environment.reportsApiUrl}/schedule-templates`;

  constructor(private http: HttpClient) {}

  async createOptionFromTemplate(
    templateUuid: string,
    clientUuid: string
  ): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/option-from-template`, {
        templateUuid,
        clientUuid,
      })
    );
  }

  async createTemplateFromOption(
    optionUuid: string,
    params: {
      name: string;
      description?: string;
      origin?: TemplateOrigin;
      visibility?: TemplateVisibility;
      organizationUuid: string | null;
    }
  ): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/template-from-option`, {
        optionUuid,
        params,
      })
    );
  }

  async getAllTemplates(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/all`)
    );
  }

  async getTemplateByUuid(templateUuid: string): Promise<SchedulingTemplate> {
    return firstValueFrom(
      this.http.get<SchedulingTemplate>(`${this.apiUrl}/${templateUuid}`)
    );
  }
}
