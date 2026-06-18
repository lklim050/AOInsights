import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface QuestionResult {
  question_text: string;
  type: 'TEXT' | 'RADIO' | 'CHECKBOX' | 'SELECT';
  counts: Record<string, number>; // this is how object are defined, string is key, number is value
  total_selections_counted: number;
  text_responses: string[];
}

interface SurveyResults {
  survey_title: string;
  total_submissions: number;
  results: Record<string, QuestionResult>;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent implements OnInit {
  surveyId!: number; // surveyId must be number
  data: SurveyResults | null = null; // initial is null where data variable can be either null or SurveyResults
  isLoading = true;
  errorMessage = '';

  questionEntries: { id: string; result: QuestionResult }[] = []; // convert object into array for ngFor iteration.

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('surveyId'));
    this.loadResults();
  }

  loadResults() {
    this.apiService.getSurveyResults(this.surveyId).subscribe({
      next: (res: SurveyResults) => {
        this.data = res;
        // suggested by Claude to map data in this way for ngFor iteration later
        this.questionEntries = Object.entries(res.results).map(
          ([id, result]) => ({ id, result }),
        );
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg || 'Failed to load results, please try again later.';
        this.isLoading = false;
      },
    });
  }

  getCountEntries(
    counts: Record<string, number>,
  ): { label: string; count: number }[] {
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  getBarWidth(count: number, counts: Record<string, number>): number {
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    return total === 0 ? 0 : Math.round((count / total) * 100);
  }

  isChoiceType(type: string): boolean {
    return ['RADIO', 'CHECKBOX', 'SELECT'].includes(type);
  }

  goBack() {
    this.router.navigate(['/host']);
  }
}
