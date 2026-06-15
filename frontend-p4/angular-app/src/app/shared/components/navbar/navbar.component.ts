import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }
  logout() {
    this.authService.logout();
  }
}
