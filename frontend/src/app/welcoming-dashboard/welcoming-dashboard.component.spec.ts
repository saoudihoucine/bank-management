import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomingDashboardComponent } from './welcoming-dashboard.component';

describe('WelcomingDashboardComponent', () => {
  let component: WelcomingDashboardComponent;
  let fixture: ComponentFixture<WelcomingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WelcomingDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
