import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesManagerComponent } from './images-manager.component';

describe('ImagesManagerComponent', () => {
  let component: ImagesManagerComponent;
  let fixture: ComponentFixture<ImagesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagesManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImagesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
