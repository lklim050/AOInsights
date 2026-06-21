import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSurvey, ApiService } from '../../../services/api.service';
import { ModalService } from '../../../core/services/modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
})
export class DashboardAdminComponent implements OnInit {
  surveys: AdminSurvey[] = [];
  filteredSurveys: AdminSurvey[] = [];
  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  togglingId: number | null = null;

  filterStatus: 'all' | 'published' | 'draft' = 'all';

  constructor(
    private apiService: ApiService,
    private modalService: ModalService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadAdminSurveys();
  }

  loadAdminSurveys() {
    this.isLoading = true;
    this.apiService.getAdminSurveys().subscribe({
      next: (res: any) => {
        this.surveys = res.surveys;
        this.filteredSurveys = res.surveys;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg || 'Failed to fetch all surveys by admin';
        this.isLoading = false;
      },
    });
  }
  onSearch() {
    this.applyFilters();
  }

  setFilter(status: 'all' | 'published' | 'draft') {
    this.filterStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.surveys];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (search) =>
          search.title.toLowerCase().includes(term) ||
          search.creator.name.toLowerCase().includes(term) ||
          search.creator.email.toLowerCase().includes(term),
      );
    }
    if (this.filterStatus === 'published') {
      result = result.filter((search) => search.is_published);
    } else if (this.filterStatus === 'draft') {
      result = result.filter((search) => !search.is_published);
    }
    this.filteredSurveys = result;
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  unlockSurvey(survey: AdminSurvey) {
    this.modalService
      .confirm({
        title: 'Unlock Survey...',
        message: `Unlock "${survey.title}" (id: ${survey.id})'s published state?`,
        confirmLabel: 'Yes, Unlock',
        cancelLabel: 'Cancel',
        danger: false,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.togglingId = survey.id;
        this.apiService.adminTogglePublish(survey.id, false).subscribe({
          next: (res: any) => {
            survey.is_published = false;
            this.togglingId = null;
            this.successMessage = `"${survey.title}" (id: ${survey.id}) unlocked successfully`;
            setTimeout(() => (this.successMessage = ''), 3000);
          },
          error: (err) => {
            this.errorMessage = err.error?.msg || 'Failed to unlock survey';
            this.togglingId = null;
          },
        });
      });
  }
  publishSurvey(survey: AdminSurvey) {
    this.modalService
      .confirm({
        title: 'Publishing survey...',
        message: `Publish "${survey.title}" (id: ${survey.id})?`,
        confirmLabel: 'Yes, Publish',
        cancelLabel: 'Cancel',
        danger: false,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.togglingId = survey.id;
        this.apiService.adminTogglePublish(survey.id, true).subscribe({
          next: (res: any) => {
            survey.is_published = true;
            this.togglingId = null;
            this.successMessage = `"${survey.title}" has been published.`;
            setTimeout(() => (this.successMessage = ''), 3000);
          },
          error: (err) => {
            this.errorMessage = err.error?.msg || 'Failed to publish survey.';
            this.togglingId = null;
          },
        });
      });
  }
  get totalSurveys(): number {
    return this.surveys.length;
  }

  get publishedCount(): number {
    return this.surveys.filter((s) => s.is_published).length;
  }

  get draftCount(): number {
    return this.surveys.filter((s) => !s.is_published).length;
  }
}
