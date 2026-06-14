import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

interface Survey {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
  created_by: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  surveys: Survey[] = [];

  isLoading = true;

  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSurveys().subscribe({
      next: (data: Survey[]) => {
        this.surveys = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load, please try again';
        this.isLoading = false;
        console.error('API error: ', err);
      },
    });
  }
}
