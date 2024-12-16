import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PaginationButtonData {
  totalItems: number,
  pageSize: number,
  currentPage: number;
}

@Component({
  selector: 'app-pagination-button',
  imports: [CommonModule],
  templateUrl: './pagination-button.component.html',
  styleUrl: './pagination-button.component.scss'
})
export class PaginationButtonComponent {
  // Eingabedaten: aktuelle Seite und Gesamtseiten
  // @Input() currentPage: number | null = null;
  // @Input() totalPages: number | null = null;

  // @Output() clickBack = new EventEmitter<void>();
  // @Output() clickForward = new EventEmitter<void>();

  @Input() totalItems!: number;
  @Input() pageSize!: number;
  @Input() currentPage!: number;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.totalPages - 1;
  }

  onPrev() {
    if (!this.isFirstPage) this.pageChange.emit(this.currentPage - 1);
  }

  onNext() {
    if (!this.isLastPage) this.pageChange.emit(this.currentPage + 1);
  }
}
