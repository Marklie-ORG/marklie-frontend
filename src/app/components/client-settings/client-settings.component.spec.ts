import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSettingsComponent } from './client-settings.component';

describe('ClientSettingsComponent', () => {
  let component: ClientSettingsComponent;
  let fixture: ComponentFixture<ClientSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
