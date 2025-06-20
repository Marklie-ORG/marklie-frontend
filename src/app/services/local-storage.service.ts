import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

export enum LocalStorageKeys {
  TARGET_CLIENT_ID_FOR_SLACK_WORKSPACE = 'target_client_id_for_slack_workspace',
}


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  setItem(key: LocalStorageKeys, value: string) {
    localStorage.setItem(key, value);
  }

  getItem(key: LocalStorageKeys) {
    return localStorage.getItem(key);
  }

  removeItem(key: LocalStorageKeys) {
    localStorage.removeItem(key);
  }

} 
