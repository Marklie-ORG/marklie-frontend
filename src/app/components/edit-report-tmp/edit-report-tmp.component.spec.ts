import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReportTmpComponent } from './edit-report-tmp.component';

describe('EditReportTmpComponent', () => {
  let component: EditReportTmpComponent;
  let fixture: ComponentFixture<EditReportTmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditReportTmpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditReportTmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
