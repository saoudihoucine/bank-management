import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateCreditComponent } from './validate-credit.component';

describe('ValidateCreditComponent', () => {
  let component: ValidateCreditComponent;
  let fixture: ComponentFixture<ValidateCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateCreditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
