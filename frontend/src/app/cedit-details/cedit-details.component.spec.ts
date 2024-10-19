import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeditDetailsComponent } from './cedit-details.component';

describe('CeditDetailsComponent', () => {
  let component: CeditDetailsComponent;
  let fixture: ComponentFixture<CeditDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CeditDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CeditDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
