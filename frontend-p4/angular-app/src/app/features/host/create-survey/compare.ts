import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.css',
})
export class CreateSurveyComponent {
  createForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      points_reward: [
        10,
        [Validators.required, Validators.min(1), Validators.max(500)],
      ],
      // ↑ Default 10 points, min 1, max 500
    });
  }

  get title() {
    return this.createForm.get('title');
  }
  get points_reward() {
    return this.createForm.get('points_reward');
  }

  onSubmit() {
    if (this.createForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { title, points_reward } = this.createForm.value;

    this.apiService.createSurvey(title, points_reward).subscribe({
      next: (res: any) => {
        // Navigate directly to manage questions for the new survey
        this.router.navigate(['/host/manage', res.survey.id]);
        // ↑ After creating survey, go straight to adding questions
        //   res.survey.id comes from your API response:
        //   { status: "ok", msg: "...", survey: { id: ... } }
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to create survey.';
        this.isLoading = false;
      },
    });
  }
}
