import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../../../core/services/auth.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LogoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;
  isDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
  }
  getInitial(): string {
    if (!this.currentUser) return '?';
    if (this.currentUser.name) {
      return this.currentUser.name[0].toUpperCase();
    }
    return this.currentUser.email[0].toUpperCase();
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-avatar-wrapper')) {
      this.isDropdownOpen = false;
    }
  }
}
