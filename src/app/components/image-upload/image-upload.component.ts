import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  uploadStatus: string | null = null;
  uploadProgress: number = 0;
  private uploadUrl = 'YOUR_BACKEND_UPLOAD_URL'; // **IMPORTANT: Replace with your actual backend URL**

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Basic client-side validation
      if (!file.type.startsWith('image/')) {
        this.uploadStatus = 'Please select an image file.';
        this.selectedFile = null;
        this.imagePreview = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = ''; // Clear the input
        }
        return;
      }

      this.selectedFile = file;
      this.uploadStatus = null; // Clear previous status
      this.uploadProgress = 0; // Reset progress

      // Read file for preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
      this.uploadStatus = null;
      this.uploadProgress = 0;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.uploadStatus = 'No file selected for upload.';
      return;
    }

    this.uploadStatus = 'Uploading...';

    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name); // 'image' is the field name your backend expects

    this.http.post(this.uploadUrl, formData, {
      reportProgress: true, // Report progress updates
      observe: 'events'     // Observe all events (including progress)
    }).pipe(
      map((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadStatus = 'Upload complete!';
          // Handle successful response from backend
          console.log('Upload successful:', event.body);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        this.uploadStatus = `Upload failed: ${error.message}`;
        console.error('Upload error:', error);
        return of(null); // Return observable of null to continue stream
      })
    ).subscribe();
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadStatus = null;
    this.uploadProgress = 0;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear the input
    }
  }
}