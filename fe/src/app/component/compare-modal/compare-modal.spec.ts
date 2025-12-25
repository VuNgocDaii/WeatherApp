import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareModal } from './compare-modal';

describe('CompareModal', () => {
  let component: CompareModal;
  let fixture: ComponentFixture<CompareModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
