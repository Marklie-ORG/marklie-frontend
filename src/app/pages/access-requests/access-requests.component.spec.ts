import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRequestsComponent } from './access-requests.component';

describe('AccessRequestsComponent', () => {
  let component: AccessRequestsComponent;
  let fixture: ComponentFixture<AccessRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccessRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
