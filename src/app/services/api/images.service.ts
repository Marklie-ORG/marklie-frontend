import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private readonly apiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  async getImages() {
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}`)
    );
  }

  async uploadImage(formData: FormData) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/upload`, formData)
    );
  }

  async deleteImage(uuid: string) {
    return firstValueFrom(
      this.http.delete<{
        message: string;
      }>(`${this.apiUrl}/${uuid}`)
    );
  }

}
