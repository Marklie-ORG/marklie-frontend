import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackLoginCallbackComponent } from './slack-login-callback.component';

describe('SlackLoginCallbackComponent', () => {
  let component: SlackLoginCallbackComponent;
  let fixture: ComponentFixture<SlackLoginCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SlackLoginCallbackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SlackLoginCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
