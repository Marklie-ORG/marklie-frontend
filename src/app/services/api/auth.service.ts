import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '@env/environment.js';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  accessToken: string;
}

interface DecodedToken {
  isAdmin: boolean;
  exp: number;
  iat: number;
  sub: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.authApiUrl}`;

  constructor(private http: HttpClient) { }

  async login(email: string, password: string): Promise<AuthResponse> {
    return firstValueFrom(this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`,
      {
        email,
        password
      },
      {
        withCredentials: true
      }
    ));
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    return firstValueFrom(this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`,
      {
        email,
        password
      },
      {
        withCredentials: true
      }
    ));
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {},
      {
        withCredentials: true
      }
    );
  }

  async refreshAndReplaceToken() {
    return new Promise(async (resolve, reject) => {
      const response = await firstValueFrom(this.refreshToken());
      console.log(response)
      this.setToken(response.accessToken);
      resolve(response);
    });
  }

  setToken(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAdmin(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload)) as DecodedToken;
      console.log(decoded);
      return decoded.isAdmin === true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  hasAccessToken() {
    return this.getAccessToken() !== null;
  }

  getAllCookies(): { [key: string]: string } {
    const cookies = document.cookie.split(';');
    const result: { [key: string]: string } = {};

    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      result[name] = decodeURIComponent(value);
    });

    return result;
  }

  getDecodedAccessTokenInfo(): any {
    const access_token = this.getAccessToken() || '';
    const decodedToken = jwtDecode(access_token);
    return (decodedToken as any);
  }

}
