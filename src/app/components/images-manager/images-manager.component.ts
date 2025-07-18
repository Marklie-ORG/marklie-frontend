import { inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ImagesService } from 'src/app/services/api/images.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-images-manager',
  templateUrl: './images-manager.component.html',
  styleUrl: './images-manager.component.scss'
})
export class ImagesManagerComponent {

  protected readonly faTrash = faTrash;

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  uploadStatus: string | null = null;
  uploadProgress: number = 0;
  images: any[] = [];

  selectedImage: any = null;

  private imagesService = inject(ImagesService);
  private dialogRef = inject(MatDialogRef<ImagesManagerComponent>);
  private data = inject(MAT_DIALOG_DATA);

  async ngOnInit(): Promise<void> {
    await this.getImages();
    this.preselectImage(this.data.preselectedImage);
  }

  async preselectImage(gsUri: string) {
    if (gsUri) this.selectedImage = this.images.find((image: any) => image.gsUri === gsUri);
  }

  selectImage(image: any) {
    if (this.selectedImage?.uuid === image.uuid) {
      this.selectedImage = null;
    } else {
      this.selectedImage = image;
    }
  }

  async getImages() {
    const response = await this.imagesService.getImages();
    this.images = response.images.sort((a: any, b: any) => {
      // Sort descending by createdAt if available, otherwise fallback to 0
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return  bDate - aDate
    });
  }

  done() {
    this.dialogRef.close(this.selectedImage);
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

    this.onUpload();
  }

  async onUpload() {
    if (!this.selectedFile) {
      this.uploadStatus = 'No file selected for upload.';
      return;
    }

    this.uploadStatus = 'Uploading...';

    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);

    await this.imagesService.uploadImage(formData);

    this.getImages();
  }

  async removeImage(uuid: string): Promise<void> {
    await this.imagesService.deleteImage(uuid);
    this.getImages();

    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadStatus = null;
    this.uploadProgress = 0;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear the input
    }
  }

}
