import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { ApiService } from '../../services/api.service';

export interface Tier {
  name: string;
  label: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  currentUser: AuthUser | null = null;
  surveysCompleted = 0;
  isLoading = true;
  errorMessage = '';

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
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.apiService.getResponsesByUser().subscribe({
      next: (res: any) => {
        this.surveysCompleted = res.responses_count || 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg ||
          'Failed to fetch responses count, please try again later';
        this.isLoading = false;
      },
    });
  }
  get points(): number {
    return this.currentUser?.points_bal ?? 0;
  }
  get currentTier(): Tier {
    return (
      [...this.tiers].reverse().find((tier) => this.points >= tier.minPoints) ||
      this.tiers[0]
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

    const pointsIntoCurrentTier = this.points - this.currentTier.minPoints;
    const tierRange = this.nextTier.minPoints - this.currentTier.minPoints;
    return Math.round((pointsIntoCurrentTier / tierRange) * 100);
  }

  get pointsToNextTier(): number {
    if (!this.nextTier) return 0;
    return this.nextTier.minPoints - this.points;
  }

  getAvatarColor(name: string): string {
    // Generate a consistent color based on the name string
    const colors = [
      '#22d3ee', // cyan
      '#14b8a6', // teal
      '#4ade80', // green
      '#818cf8', // indigo
      '#fb7185', // rose
      '#fb923c', // orange
      '#facc15', // yellow
      '#a78bfa', // violet
      '#34d399', // emerald
      '#60a5fa', // blue
    ];

    // Convert name to a number by summing char codes
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }

    return colors[hash % colors.length];
  }
}
