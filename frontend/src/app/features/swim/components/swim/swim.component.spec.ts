import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimComponent } from './swim.component';

describe('SwimComponent', () => {
  let component: SwimComponent;
  let fixture: ComponentFixture<SwimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
