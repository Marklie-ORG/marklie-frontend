import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmailChangeComponent } from './verify-email-change.component';

describe('VerifyEmailChangeComponent', () => {
  let component: VerifyEmailChangeComponent;
  let fixture: ComponentFixture<VerifyEmailChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyEmailChangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyEmailChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
