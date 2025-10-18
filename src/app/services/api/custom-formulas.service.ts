import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';
import type { CreateAdAccountCustomFormulaRequest, UpdateAdAccountCustomFormulaRequest } from '../../interfaces/interfaces.js';


@Injectable({
  providedIn: 'root'
})
export class CustomFormulasService {
  private apiUrl = `${environment.reportsApiUrl}/custom-formulas`;

  private headers = {
    'ngrok-skip-browser-warning': 'true'
  };

  constructor(private http: HttpClient) {}

  createCustomFormula(data: CreateAdAccountCustomFormulaRequest): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiUrl}/`, data));
  }

  getCustomFormula(uuid: string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.apiUrl}/${uuid}`, { headers: this.headers }));
  }

  getAdAccountCustomFormulas(adAccountId: string): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/ad-account/${adAccountId}`, { headers: this.headers }));
  }

  updateCustomFormula(uuid: string, data: UpdateAdAccountCustomFormulaRequest): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiUrl}/${uuid}`, data));
  }

  deleteCustomFormula(uuid: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${uuid}`));
  }
}

