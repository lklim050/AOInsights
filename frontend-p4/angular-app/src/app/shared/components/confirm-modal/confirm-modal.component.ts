import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ModalConfig,
  ModalService,
} from '../../../core/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  config: ModalConfig = {
    title: '',
    message: '',
    confirmLabel: '',
    cancelLabel: '',
    danger: false,
  };

  private subscription!: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.subscription = this.modalService.open$.subscribe((config) => {
      this.config = {
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        danger: false,
        ...config,
      };
      this.isVisible = true;
    });
  }

  onConfirm() {
    this.isVisible = false;
    this.modalService.resolve(true);
  }

  onCancel() {
    this.isVisible = false;
    this.modalService.resolve(false);
  }

  //cleanup
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
