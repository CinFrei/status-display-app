import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkkuComponent } from './akku.component';

describe('AkkuComponent', () => {
  let component: AkkuComponent;
  let fixture: ComponentFixture<AkkuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkkuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AkkuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
