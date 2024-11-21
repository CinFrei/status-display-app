import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HalfCardSquareComponent } from './half-card-square.component';

describe('HalfCardSquareComponent', () => {
  let component: HalfCardSquareComponent;
  let fixture: ComponentFixture<HalfCardSquareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HalfCardSquareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HalfCardSquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
