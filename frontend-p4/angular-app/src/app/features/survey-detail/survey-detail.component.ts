import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiService,
  Question,
  SurveyDetail,
  SurveyResponse,
} from '../../services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Tier } from '../profile/profile.component';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-detail.component.html',
  styleUrl: './survey-detail.component.css',
})
export class SurveyDetailComponent implements OnInit {
  survey: SurveyDetail | null = null;
  surveyForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  pointsEarned = 0;
  newBalance = 0;
  submitted = false;
  previousResponse: SurveyResponse | null = null;
  showPreviousResponse = false;
  tiers: Tier[] = [
    {
      name: 'Bronze',
      label: '🥉 Bronze',
      minPoints: 0,
      maxPoints: 100,
      color: '#92400e',
      bgColor: '#fef3c7',
    },
    {
      name: 'Silver',
      label: '🥈 Silver',
      minPoints: 100,
      maxPoints: 300,
      color: '#374151',
      bgColor: '#f3f4f6',
    },
    {
      name: 'Gold',
      label: '🥇 Gold',
      minPoints: 300,
      maxPoints: 700,
      color: '#92400e',
      bgColor: '#fef9c3',
    },
    {
      name: 'Platinum',
      label: '💎 Platinum',
      minPoints: 700,
      maxPoints: Infinity,
      // ↑ Infinity means no upper limit — once platinum, always platinum
      color: '#1e40af',
      bgColor: '#dbeafe',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.surveyForm = this.formBuilder.group({
      answers: this.formBuilder.array([]),
    });
  }

  get answers(): FormArray {
    return this.surveyForm.get('answers') as FormArray;
  }

  ngOnInit() {
    const surveyId = Number(this.route.snapshot.paramMap.get('id'));

    this.apiService.getSurveyDetail(surveyId).subscribe({
      next: (res: any) => {
        this.survey = res.survey;
        this.previousResponse = res.survey_response ?? null; // null if no previous response
        this.buildForm(res.survey.questions);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load survey.';
        this.isLoading = false;
      },
    });
  }

  getAnswerByQuestionId(questionId: number): string | string[] | null {
    if (!this.previousResponse) return null;
    const found = this.previousResponse.answers_payload.find(
      (answer) => answer.question_id === questionId,
    );
    return found?.answer ?? null;
  }

  isArrayAnswer(answer: string | string[]): boolean {
    return Array.isArray(answer);
  }

  togglePreviousResponse() {
    this.showPreviousResponse = !this.showPreviousResponse;
  }

  buildForm(questions: Question[]) {
    questions.forEach((question) => {
      if (question.type === 'CHECKBOX') {
        const checkboxArray = this.formBuilder.array(
          (question.options || []).map(() => this.formBuilder.control(false)),
        );
        this.answers.push(checkboxArray);
      } else {
        this.answers.push(this.formBuilder.control('', Validators.required));
      }
    });
  }
  getCheckboxValues(questionIndex: number, options: string[]): string[] {
    const checkboxArray = this.answers.at(questionIndex) as FormArray;
    return options.filter((_, i) => checkboxArray.at(i).value);
  }

  onSubmit() {
    if (this.surveyForm.invalid || !this.survey) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const answersPayload = this.survey.questions.map((question, index) => {
      let answer: string | string[];

      if (question.type === 'CHECKBOX') {
        answer = this.getCheckboxValues(index, question.options || []);
      } else {
        answer = this.answers.at(index).value;
      }
      return { question_id: question.id, answer };
    });

    this.apiService
      .submitSurvey({
        survey_id: this.survey.id,
        answers_payload: answersPayload,
      })
      .subscribe({
        next: (res: any) => {
          this.submitted = true;
          this.pointsEarned = res.reward_points;
          this.newBalance = res.new_total_balance;
          this.refreshUserPoints(res.new_total_balance);
        },
        error: (err) => {
          this.errorMessage =
            err.error?.msg || 'Submission failed. Please try again.';
          this.isSubmitting = false;
        },
      });
  }

  refreshUserPoints(newBalance: number) {
    const current = this.authService.currentUser;
    if (current) {
      const updated = { ...current, points_bal: newBalance };
      this.authService.setUser(updated);
    }
  }

  get currentTier(): Tier {
    return (
      [...this.tiers]
        .reverse()
        .find((tier) => this.newBalance >= tier.minPoints) || this.tiers[0]
    );
  }

  // next tier user can go
  get nextTier(): Tier | null {
    const currentIndex = this.tiers.findIndex(
      (tier) => tier.name === this.currentTier.name,
    );
    return currentIndex < this.tiers.length - 1
      ? this.tiers[currentIndex + 1]
      : null;
  }

  get progressToNextTier(): number {
    if (!this.nextTier) return 100;

    const pointsIntoCurrentTier = this.newBalance - this.currentTier.minPoints;
    const tierRange = this.nextTier.minPoints - this.currentTier.minPoints;
    return Math.round((pointsIntoCurrentTier / tierRange) * 100);
  }

  get pointsToNextTier(): number {
    if (!this.nextTier) return 0;
    return this.nextTier.minPoints - this.newBalance;
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
