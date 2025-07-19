import { Component, inject, input, model } from '@angular/core';
import { ImagesManagerService } from 'src/app/services/images-manager.service';

@Component({
  selector: 'report-header',
  templateUrl: './report-header.component.html',
  styleUrl: './report-header.component.scss'
})
export class ReportHeaderComponent {

  reportTitle = input<string>('');
  selectedDatePresetText = input<string>('');
  isViewMode = input<boolean>(false);

  clientImageUrl = model<string>('');
  clientImageGsUri = model<string>('');
  agencyImageUrl = model<string>('');
  agencyImageGsUri = model<string>('');
  
  private imagesManagerService = inject(ImagesManagerService);

  async getImage(type: 'client' | 'agency', preselectedImage?: string) {
    const image = await this.imagesManagerService.getImage(preselectedImage);

    const isClient = type === 'client';
    const urlModel = isClient ? this.clientImageUrl : this.agencyImageUrl;
    const gsUriModel = isClient ? this.clientImageGsUri : this.agencyImageGsUri;

    if (image) {
      urlModel.set(image.imageUrl);
      gsUriModel.set(image.gsUri);
    } else {
      urlModel.set('');
      gsUriModel.set('');
    }
  }

}
