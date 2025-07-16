import { Injectable } from '@angular/core';
import { ImagesManagerComponent } from '../components/images-manager/images-manager.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagesManagerService {

  constructor(
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  async getImage(preselectedImage?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialogRef = this.dialog.open(ImagesManagerComponent, {
        width: '800px',
        data: {
          preselectedImage: preselectedImage
        }
        // data: {
        //   reportSections: this.reportSections,
        //   clientUuid: this.clientUuid,
        //   schedule: this.schedule,
        //   messages: this.messages,
        //   datePreset: this.selectedDatePreset,
        // }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result)
        resolve(result)
      })

    });
  }

  

 

}
