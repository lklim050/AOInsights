## Angular (Road to Angular App Setup Guide)

### Table of Contents

- [Prequisites (Ask Copilot to do the scaffolding for you)](#prequisites-ask-copilot-to-do-the-scaffolding-for-you)
- [Install Angular CLI globally](#install-angular-cli-globally)
- [Test API service](#test-api-service)
  - [1. Generate API service, Component](#1-generate-api-service-component)
  - [2. Setup route for home in app.routes.ts](#2-setup-route-for-home-in-approutests)
  - [3. Wire Up API service](#3-wire-up-api-service)
  - [4. Add a interface](#4-add-a-interface) - [Build Auth Service](#build-auth-service)
  - [1. Generate core and features](#1-generate-core-and-features)
  - [2. Implement auth service, interceptor, guard](#2-implement-auth-service-interceptor-guard)
  - [3. Implement component Typescript and Design UI for auth(login and register components)]
- [Build Navbar](#build-navbar)
  - [1. Generate Navbar component](#1-generate-navbar-component)
  - [2. Implement Navbar Component Typescript](#2-implement-navbar-component-typescript)
  - [3. Design Navbar Component HTML, CSS](#3-design-navbar-component-html-css)
  - [4. Add Navbar to AppComponent](#4-add-navbar-to-appcomponent)
- [Build Survey Response Page](#build-survey-response-page)
  - [1. Generate Survey Response Component](#1-generate-survey-response-component)
  - [2. Setup API service method for getting and submitting survey response](#2-setup-api-service-method-for-getting-and-submitting-survey-response)
  - [3. Implement Survey Response Component Typescript](#3-implement-survey-response-component-typescript)
  - [4. Design Survey Response Component HTML, CSS](#4-design-survey-response-component-html-css)
  - [5. Add navigation method for survey response page](#5-add-navigation-method-for-survey-response-page)
  - [6. Add route for survey response page](#6-add-route-for-survey-response-page)
  - [7. Some adjustment for AuthService](#7-some-adjustment-for-authservice)
- [Build Host Dashboard](#build-host-dashboard)
  - [1. Generate Host Dashboard Component](#1-generate-host-dashboard-component)
  - [2. Implement HOST Guard and add to route](#2-implement-host-guard-and-add-to-route)
  - [3. Setup API Methods](#3-setup-api-methods)
  - [4. Implement Host Dashboard Component Typescript](#4-implement-host-dashboard-component-typescript)
  - [5. Implement Create Survey Component Typescript](#5-implement-create-survey-component-typescript)
  - [6. Implement Manage Questions Component Typescript](#6-implement-manage-questions-component-typescript)
  - [7. Implement Results Component Typescript](#7-implement-results-component-typescript)
  - [8. Add navigation method for result page](#8-add-navigation-method-for-host-dashboard-page)
  - [9. Add route for host dashboard page](#9-add-route-for-host-dashboard-page)

### Prequisites (Ask Copilot to do the scaffolding for you)

### Install Angular CLI globally

```bash
npm install -g @angular/cli
ng version
```

### Test API service

#### 1. Generate API service, Component

```bash
ng generate service services/api
```

```bash
ng generate component features/home
```

#### 2. Setup route for home in app.routes.ts

```typescript
import { Routes } from "@angular/router";
import { HomeComponent } from "./features/home/home.component";

export const routes: Routes = [{ path: "", component: HomeComponent }];
```

#### 3. Wire Up API service

- at api.service.ts, add the following code to test the API service:

`````typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys`);
  }
}

- at home.component.ts, add the following code to test the API service:
````typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  surveys: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSurveys().subscribe({
      next: (data: any) => this.surveys = data,
      error: (err) => console.error('API error:', err)
    });
  }
}

`````

- at the home.component.html, add the following code to display the API data:

```html
<h1>Surveys</h1>
<pre>{{ surveys | json }}</pre>
```

- note: when hit with CORS errors,you may need to setup cors at backend with the following:

```bash
npm install cors
```

```javascript
const cors = require("cors");
app.use(cors({ origin: "http://localhost:4200" }));
```

#### 4. Add a interface

- at the home.component.ts, adjust the following code to define the interface:

```typescript
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../services/api.service";

// ↑ Define the shape of your survey data
//   This replaces 'any' with a proper TypeScript interface
//   Now TypeScript will warn you if you mistype a property name
interface Survey {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
  created_by: string;
}

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  surveys: Survey[] = [];
  // ↑ Now typed as Survey[] instead of any[]
  //   TypeScript now knows exactly what properties exist
  isLoading = true;
  // ↑ Controls showing a loading state while data fetches
  errorMessage = "";
  // ↑ Holds any error message to display to user

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSurveys().subscribe({
      next: (data: Survey[]) => {
        this.surveys = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Failed to load surveys. Please try again.";
        this.isLoading = false;
        console.error("API error:", err);
      },
    });
  }
}
```

- at the home.component.html, adjust the following code to display loading and error states:

```html
<div class="container">
  <!-- Loading state -->
  <div *ngIf="isLoading" class="loading">Loading surveys...</div>

  <!-- Error state -->
  <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

  <!-- Survey list -->
  <div *ngIf="!isLoading && !errorMessage">
    <h1>Community Surveys</h1>
    <p class="subtitle">Complete surveys and earn points!</p>

    <div class="survey-grid">
      <div class="survey-card" *ngFor="let survey of surveys">
        <!-- ↑ *ngFor loops over your surveys array
              and creates one card per survey -->

        <div class="card-header">
          <h2>{{ survey.title }}</h2>
        </div>

        <div class="card-body">
          <span class="points-badge"> 🏆 {{ survey.points_reward }} pts </span>
        </div>

        <div class="card-footer">
          <button class="btn-primary">Take Survey</button>
        </div>
      </div>
    </div>

    <p *ngIf="surveys.length === 0" class="empty">
      No surveys available right now.
    </p>
    <!-- ↑ Handles the edge case of empty array -->
  </div>
</div>
```

### Build Auth Service

#### 1. Generate core and features

```bash
ng generate service core/services/auth
ng generate interceptor core/interceptors/auth
ng generate guard core/guards/auth
ng generate component features/auth/login
ng generate component features/auth/register
```

#### 2. Implement auth service, interceptor, guard

- at auth.service.ts, add the following code to implement the auth service:

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, tap } from "rxjs";

// ↑ BehaviorSubject: a special Observable that holds a
//   current value and emits it to new subscribers immediately.
//   Perfect for storing "is the user logged in?" state
//   that any component can subscribe to.

export interface AuthUser {
  uuid: string;
  email: string;
  role: "USER" | "HOST" | "ADMIN";
  access: string;
  refresh: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private baseUrl = "http://localhost:3000/users";

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadFromStorage(),
  );
  // ↑ Initialise from localStorage so login persists
  //   across page refreshes. Starts as null if not logged in.

  currentUser$ = this.currentUserSubject.asObservable();
  // ↑ Public Observable that components subscribe to.
  //   The $ suffix is a convention meaning "this is an Observable"

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ── Getters ───────────────────────────────────────────

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
    // ↑ Synchronous access to current user — useful when
    //   you just need a quick check without subscribing
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
    // ↑ !! converts to boolean: null → false, object → true
  }

  get isHost(): boolean {
    return this.currentUser?.role === "HOST";
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === "ADMIN";
  }

  get accessToken(): string | null {
    return this.currentUser?.access ?? null;
    // ↑ Used by AuthInterceptor to attach to requests
  }

  // ── Auth Methods ──────────────────────────────────────

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((user) => this.setUser(user)),
        // ↑ tap: performs a side effect (saving user) without
        //   changing the Observable value. Like a middleware step.
      );
  }

  register(
    email: string,
    name: string,
    password: string,
    role?: string,
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/register`, {
      email,
      name,
      password,
      role,
    });
    // ↑ PUT /users/register per your API dictionary
  }

  logout() {
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe();
    this.clearUser();
    this.router.navigate(["/login"]);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = this.currentUser?.refresh;
    return this.http
      .post<{ access: string }>(`${this.baseUrl}/refresh`, { refresh })
      .pipe(
        tap((res) => {
          if (this.currentUser) {
            this.setUser({ ...this.currentUser, access: res.access });
            // ↑ Update only the access token, keep everything else
          }
        }),
      );
  }

  // ── Private Helpers ───────────────────────────────────

  private setUser(user: AuthUser) {
    localStorage.setItem("some_user", JSON.stringify(user));
    this.currentUserSubject.next(user);
    // ↑ .next() pushes a new value to all subscribers
  }

  private clearUser() {
    localStorage.removeItem("some_user");
    this.currentUserSubject.next(null);
  }

  private loadFromStorage(): AuthUser | null {
    const stored = localStorage.getItem("some_user");
    return stored ? JSON.parse(stored) : null;
    // ↑ Runs once on app startup to rehydrate login state
  }
}
```

- at auth.interceptor.ts, add the following code to implement the auth interceptor:

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // ↑ inject() is how you get services inside a
  //   functional interceptor (Angular 17 style)

  const token = authService.accessToken;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  // ↑ Clone the request (requests are immutable) and
  //   attach the Bearer token if one exists.
  //   If no token, pass request through unchanged.

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(["/login"]);
        // ↑ Auto-logout if backend returns 401 Unauthorized
      }
      return throwError(() => error);
    }),
  );
};
```

- update app.config.ts, you need to add in the interceptor (withInterceptors and authInterceptor) as follows:

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { routes } from "./app.routes";
import { authInterceptor } from "./core/interceptors/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // ↑ Registers your interceptor globally — every HTTP
    //   request now automatically goes through authInterceptor
  ],
};
```

- at auth.guard.ts, you can implement the guard as follows:

```typescript
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
    // ↑ User is logged in — allow navigation to the route
  }

  router.navigate(["/login"]);
  return false;
  // ↑ Not logged in — redirect to login page
};
```

- update app.routes.ts, you can add the newly created component, guard to protected routes as follows:

```typescript
import { Routes } from "@angular/router";
import { HomeComponent } from "./features/home/home.component";
import { LoginComponent } from "./features/auth/login/login.component";
import { RegisterComponent } from "./features/auth/register/register.component";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", component: HomeComponent, canActivate: [authGuard] },
  // ↑ canActivate: [authGuard] means only logged-in
  //   users can access this route
  { path: "**", redirectTo: "" },
  // ↑ Wildcard — any unknown route redirects to home
];
```

#### 3. Implement component Typescript and Design UI for auth(login and register components)

- at login.component.ts, you can add the following code to design the login page:

`````typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// ↑ ReactiveFormsModule: Angular's way of handling forms in code
//   rather than in the template. More powerful than template-driven
//   forms — easier to validate, test, and control programmatically.
//   FormBuilder: helper that creates form controls cleanly
//   Validators: built-in validation rules (required, email, minLength etc.)

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // ↑ ['', [...]] means: default value '', with these validators
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Handy getter so template can access controls cleanly
  // e.g. this.email instead of this.loginForm.get('email')
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) return;
    // ↑ Double safety check — don't submit if validation fails

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        // Redirect based on role after login
        if (user.role === 'HOST' || user.role === 'ADMIN') {
          this.router.navigate(['/host']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
```

- at login.component.html, you can add the following code to design the login page:
_to be added..._

- at login.component.css, you can add the following code to design the login page:
_to be added..._

- at register.component.ts, you can add the following code to design the register page:

````typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER']
      // ↑ Default role is USER — HOST can be selected in the form
    });
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get role() { return this.registerForm.get('role'); }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password, role } = this.registerForm.value;

    this.authService.register(email, name, password, role).subscribe({
      next: () => {
        this.successMessage = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
        // ↑ Brief success message before redirect
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
`````

- at register.component.html, you can add the following code to design the register page:
  _to be added..._

- at register.component.css, you can add the following code to design the login page:
  _to be added..._

- after components created, you need to route to navigate between login and register pages as follows:

```typescript
import { Routes } from "@angular/router";
import { HomeComponent } from "./features/home/home.component";
import { LoginComponent } from "./features/auth/login/login.component";
import { RegisterComponent } from "./features/auth/register/register.component";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", component: HomeComponent, canActivate: [authGuard] },
  { path: "**", redirectTo: "" },
];
```

### Build Navbar

#### 1. Generate Navbar component

- At bash ,generate Navbar component as follows:

```bash
ng generate component shared/components/navbar
```

#### 2. Implement Navbar Component Typescript

- at navbar.component.ts, add the following code:

```Typescript
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;
  isDropdownOpen = false;
  // ↑ Controls dropdown visibility

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // ↑ Subscribe to user state changes — navbar updates
      //   automatically when user logs in or out
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
    // Try name first, fall back to email
    if (this.currentUser.name) {
      return this.currentUser.name[0].toUpperCase();
    }
    return this.currentUser.email[0].toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-avatar-wrapper')) {
      this.isDropdownOpen = false;
    }
    // ↑ HostListener listens to clicks on the entire document
    //   If click is outside .nav-avatar-wrapper, close dropdown
    //   This is the Angular equivalent of React's useEffect
    //   with document.addEventListener('click', handler)
  }
}
```

#### 3. Design Navbar Component HTML, CSS

- at navbar.component.html, you can add the following code to design the navbar:
  _to be added..._

- at navbar.component.css, you can add the following code to design the navbar:
  _to be added..._

#### 4. Register Navbar to AppComponent

- at app.component.html, you can add the following code to add the navbar to the app:

```html
<app-navbar />
<br />
<router-outlet />
```

- at app.component.ts, import the navbar component as follows:

```Typescript
...
import { NavbarComponent } from './shared/components/navbar/navbar.component';
...
imports: [... NavbarComponent],
```

### Build Survey Response Page

#### 1. Generate Survey Response Component

```bash
ng generate component features/survey-response
```

#### 2. Setup API service method for getting and submitting survey response

- at api.service.ts, you can add the following code to implement the API service method for getting and submitting survey response:

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Question {
  id: number;
  survey_id: number;
  question_text: string;
  type: "TEXT" | "RADIO" | "CHECKBOX" | "SELECT";
  options: string[] | null;
}

export interface SurveyDetail {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
  questions: Question[];
}

export interface AnswerItem {
  question_id: number;
  answer: string | string[];
}

export interface SubmitPayload {
  survey_id: number;
  answers_payload: AnswerItem[];
}

export interface SurveyResponse {
  response_id: number;
  user_id: string;
  survey_id: string;
  answers_payload: AnswerItem[];
  status: string;
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private baseUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys`);
  }

  getSurveyDetail(surveyId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/surveys/${surveyId}`, {});
    // ↑ Your API uses POST to get a single survey — unusual
    //   but that's what your API dictionary specifies
  }

  submitSurvey(payload: SubmitPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/responses/submit`, payload);
  }
}
```

#### 3. Implement Survey Detail Component Typescript

- at survey-detail.component.ts, you can add the following code to implement the survey detail page:

```typescript
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService, Question, SurveyDetail } from "../../services/api.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-survey-detail",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./survey-detail.component.html",
  styleUrl: "./survey-detail.component.css",
})
export class SurveyDetailComponent implements OnInit {
  survey: SurveyDetail | null = null;
  surveyForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = "";
  successMessage = "";
  pointsEarned = 0;
  newBalance = 0;
  submitted = false;
  previousResponse: SurveyResponse | null = null;
  showPreviousResponse = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.surveyForm = this.fb.group({
      answers: this.fb.array([]),
    });
  }

  get answers(): FormArray {
    return this.surveyForm.get("answers") as FormArray;
  }

  ngOnInit() {
    const surveyId = Number(this.route.snapshot.paramMap.get("id"));

    this.apiService.getSurveyDetail(surveyId).subscribe({
      next: (res: any) => {
        this.survey = res.survey;
        this.previousResponse = res.survey_response ?? null; // null if no previous response
        this.buildForm(res.survey.questions);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || "Failed to load survey.";
        this.isLoading = false;
      },
    });
  }

  getAnswerByQuestionId(questionId: number): string | string[] | null {
    if (!this.previousResponse) return null;
    const found = this.previousResponse.answers_payload.find(
      (a) => a.question_id === questionId,
    );
    return found?.answer ?? null;
    // ↑ Looks up the answer for a specific question by ID
    //   Returns null if not found
  }

  isArrayAnswer(answer: string | string[]): boolean {
    return Array.isArray(answer);
    // ↑ Helper to determine if answer is checkbox (array)
    //   vs single value (string) in the template
  }

  togglePreviousResponse() {
    this.showPreviousResponse = !this.showPreviousResponse;
  }

  buildForm(questions: Question[]) {
    questions.forEach((q) => {
      if (q.type === "CHECKBOX") {
        const checkboxArray = this.fb.array(
          (q.options || []).map(() => this.fb.control(false)),
        );
        this.answers.push(checkboxArray);
      } else {
        this.answers.push(this.fb.control("", Validators.required));
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
    this.errorMessage = "";

    const answersPayload = this.survey.questions.map((q, index) => {
      let answer: string | string[];

      if (q.type === "CHECKBOX") {
        answer = this.getCheckboxValues(index, q.options || []);
      } else {
        answer = this.answers.at(index).value;
      }

      return { question_id: q.id, answer };
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
          this.errorMessage = err.error?.msg || "Submission failed.";
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

  goHome() {
    this.router.navigate(["/"]);
  }
}
```

#### 4. Design Survey Detail Component HTML, CSS

- at survey-detail.component.html, you can add the following code to design the survey detail page:
  _to be added..._
- at survey-detail.component.css, you can add the following code to design the survey detail page:
  _to be added..._

#### 5. Add navigation method for survey detail page

- at home.component.ts, you can add the following code to add navigation for survey detail page:

```typescript
import { Router } from '@angular/router';

// Add Router to constructor
constructor(
  private apiService: ApiService,
  private router: Router
) {}

// Add this method
onTakeSurvey(surveyId: number) {
  this.router.navigate(['/survey', surveyId]);
  // ↑ Navigates to /survey/1 or /survey/2 etc.
}
```

- at home.component.html, you can add the following code to add navigation for survey detail page:

```html
<button class="btn-primary" (click)="onTakeSurvey(survey.id)">
  Take Survey
</button>
```

#### 6. Add route for survey detail page

- at app.routes.ts, you can add the following code to add route for survey detail page:

```typescript
import { SurveyDetailComponent } from './features/survey-detail/survey-detail.component';
...
...
  { path: 'survey/:id', component: SurveyDetailComponent, canActivate: [authGuard] },
```

#### 7. Some adjustment for AuthService

- at auth.service.ts, you can add the following code to make setUser method public:

```typescript
public setUser(user: AuthUser) {
  localStorage.setItem('crowdtask_user', JSON.stringify(user));
  this.currentUserSubject.next(user);
}
```

### Build Host Dashboard

#### 1. Generate Host Dashboard Component

```bash
ng generate component features/host/dashboard
ng generate component features/host/create-survey
ng generate component features/host/manage-questions
ng generate component features/host/results
```

#### 2. Implement HOST Guard and add to route

```bash
ng generate guard core/guards/host
```

- at host.guard.ts, add the following code:

```typescript
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const hostGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isHost || authService.isAdmin) {
    return true;
    // ↑ Only HOST and ADMIN roles can pass
  }

  router.navigate(["/"]);
  return false;
  // ↑ Regular USERs get redirected to home
};
```

- at app.routes.ts, insert the guard to the host component path as follows:

```Typescript
import { hostGuard } from './core/guards/host.guard';
...
...
{path : 'host', component: someHostComponent, canActivate:[HostGuard]}
...
...
```

#### 3. Setup API Methods

- at api.service.ts, add additional code as follows:

```Typescript
...
// ── Host Survey Methods ──────────────────────────────

getHostSurveys(): Observable<any> {
  return this.http.get(`${this.baseUrl}/surveys`);
  // ↑ GET /surveys returns surveys owned by logged-in host
}

createSurvey(title: string, pointsReward: number): Observable<any> {
  return this.http.put(`${this.baseUrl}/surveys`, {
    title,
    points_reward: pointsReward,
    is_published: false
    // ↑ Always create as draft first — host publishes manually
  });
}

updateSurvey(surveyId: number, data: Partial<{title: string, points_reward: number, is_published: boolean}>): Observable<any> {
  return this.http.patch(`${this.baseUrl}/surveys/${surveyId}`, data);
}

deleteSurvey(surveyId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/surveys/${surveyId}`);
}

getSurveyResults(surveyId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/surveys/${surveyId}/results`);
}
// ── Question Methods ─────────────────────────────────

getQuestions(surveyId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/questions/survey/${surveyId}`);
}

createQuestion(surveyId: number, questionText: string, type: string, options?: string[]): Observable<any> {
  return this.http.put(`${this.baseUrl}/questions`, {
    survey_id: surveyId,
    question_text: questionText,
    type,
    options: options || null
  });
}

deleteQuestion(questionId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/questions/${questionId}`);
}

updateQuestion(questionId: number, data: {
  question_text?: string;
  type?: string;
  options?: string[];
}): Observable<any> {
  return this.http.patch(`${this.baseUrl}/questions/${questionId}`, data);
}
...
```

#### 4. Implement Host Dashboard Component Typescript, HTML, CSS

- at dashboard.component.ts, you can add the following code to implement the host dashboard page:

```Typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface HostSurvey {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  surveys: HostSurvey[] = [];
  isLoading = true;
  errorMessage = '';
  isPublishing = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSurveys();
  }

  loadSurveys() {
    this.apiService.getHostSurveys().subscribe({
      next: (res: any) => {
        this.surveys = res.surveys;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load surveys.';
        this.isLoading = false;
      }
    });
  }

  togglePublish(survey: HostSurvey) {
    if (survey.is_published) return;
    if (!confirm(`Publish "${survey.title}"? Action cannot be undone.`)) return;
    // this.togglingId = survey.id;
    this.isPublishing = true;
    this.apiService
      .updateSurvey(survey.id, {
        is_published: true, // cannot be undone
      })
      .subscribe({
        next: (res: any) => {
          survey.is_published = true;
          // this.togglingId = null;
          this.isPublishing = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.msg || 'Failed to update survey';
          this.isPublishing = false;
        },
      });
  }

  manageQuestions(surveyId: number) {
    this.router.navigate(['/host/manage', surveyId]);
  }

  deleteSurvey(survey: HostSurvey) {
    if (survey.is_published) return;
    if (!confirm(`Delete "${survey.title}"? Action cannot be undone.`)) return;

    this.apiService.deleteSurvey(survey.id).subscribe({
      next: () => {
        this.surveys = this.surveys.filter((s) => s.id !== survey.id);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to delete survey';
      },
    });
  }
}
```

- at at dashboard.component.html, add the following code:
  _to be added later_

- at at dashboard.component.css, add the following code:
  _to be added later_

#### 5. Implement Create Survey Component Typescript, HTML, CSS

- at create-survey.component.ts, add the following code:

```Typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-survey.component.html',
  styleUrl: './create-survey.component.css'
})
export class CreateSurveyComponent {
  createForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      points_reward: [10, [Validators.required, Validators.min(1), Validators.max(500)]]
      // ↑ Default 10 points, min 1, max 500
    });
  }

  get title() { return this.createForm.get('title'); }
  get points_reward() { return this.createForm.get('points_reward'); }

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
      }
    });
  }
}
```

- at create-survey.component.html, add the following code:
  _to be added later_
- at create-survey.component.css, add the following code:
  _to be added later_

#### 6. Implement Manage Questions Component Typescript, HTML, CSS

- at manage-questions.component.ts, add the following code:

```Typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Question } from '../../services/api.service';
// ↑ Adjust path based on your actual api.service.ts location

@Component({
  selector: 'app-manage-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-questions.component.html',
  styleUrl: './manage-questions.component.css'
})
export class ManageQuestionsComponent implements OnInit {
  surveyId!: number;
  // ↑ ! tells TypeScript "this will definitely be set
  //   before use" — set in ngOnInit from route params

  questions: Question[] = [];
  isLoading = true;
  isAdding = false;
  // ↑ Controls showing the add question form
  errorMessage = '';
  successMessage = '';

  questionTypes = ['TEXT', 'RADIO', 'CHECKBOX', 'SELECT'];
  // ↑ Dropdown options for question type selector

  addForm: FormGroup;
  editingQuestionId: number | null = null;
  // ↑ Tracks which question is currently being edited
  //   null means no question is in edit mode
  editForm: FormGroup;
  // ↑ Separate form for editing — keeps add and edit
  //   forms independent of each other
  isUpdating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.addForm = this.fb.group({
      question_text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['RADIO', Validators.required],
      // ↑ Default to RADIO as it's most common question type
      options: this.fb.array([])
      // ↑ FormArray for dynamic options (RADIO, CHECKBOX, SELECT)
      //   stays empty for TEXT questions
    });
    // Edit form has same structure as add form
    this.editForm = this.fb.group({
      question_text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['RADIO', Validators.required],
      options: this.fb.array([])
    });
  }

  get question_text() { return this.addForm.get('question_text'); }
  get type() { return this.addForm.get('type'); }
  get options(): FormArray {
    return this.addForm.get('options') as FormArray;
  }
 // ── New Edit Getters ─────────────────────────────
  get editQuestionText() { return this.editForm.get('question_text'); }
  get editType() { return this.editForm.get('type'); }
  get editOptions(): FormArray {
    return this.editForm.get('options') as FormArray;
    // ↑ Separate getter for edit form's options array
  }

  ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('surveyId'));
    this.loadQuestions();

    // Watch for type changes to manage options array
    this.type?.valueChanges.subscribe(type => {
      this.onTypeChange(type);
      // ↑ When host changes question type, reset options
      //   e.g. switching from RADIO to TEXT clears options
    });
    // Watch edit form type changes too
    this.editType?.valueChanges.subscribe(type => {
      this.onEditTypeChange(type);
      // ↑ Same pattern as add form but for edit form
    });
  }

  loadQuestions() {
    this.isLoading = true;
    this.apiService.getQuestions(this.surveyId).subscribe({
      next: (res: any) => {
        this.questions = res.questions;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load questions.';
        this.isLoading = false;
      }
    });
  }

  onTypeChange(type: string) {
    // Clear existing options
    while (this.options.length) {
      this.options.removeAt(0);
    }
    // ↑ Clear FormArray by removing from the end

    // Pre-populate 2 empty options for choice-based types
    if (type !== 'TEXT') {
      this.addOption();
      this.addOption();
      // ↑ Start with 2 blank options — host adds more as needed
    }
  }

  addOption() {
    this.options.push(
      this.fb.control('', Validators.required)
      // ↑ Each option is a simple required string control
    );
  }

  removeOption(index: number) {
    if (this.options.length <= 2) {
      this.errorMessage = 'Must have at least 2 options.';
      return;
    }
    // ↑ Enforce minimum 2 options for choice questions
    this.options.removeAt(index);
  }

  toggleAddForm() {
    this.isAdding = !this.isAdding;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isAdding) {
      // Reset form and pre-populate options for default type RADIO
      this.addForm.reset({ type: 'RADIO', question_text: '' });
      while (this.options.length) this.options.removeAt(0);
      this.addOption();
      this.addOption();
    }
  }

  onSubmit() {
    if (this.addForm.invalid) return;

    const { question_text, type } = this.addForm.value;
    const optionsValue = type === 'TEXT'
      ? undefined
      : this.options.controls.map(c => c.value);
    // ↑ TEXT questions have no options — send null
    //   All other types send the options array

    this.apiService.createQuestion(
      this.surveyId,
      question_text,
      type,
      optionsValue
    ).subscribe({
      next: (res: any) => {
        this.questions.push(res.question);
        // ↑ Add new question to local array immediately
        //   without re-fetching all questions
        this.successMessage = 'Question added successfully!';
        this.isAdding = false;
        this.addForm.reset({ type: 'RADIO', question_text: '' });
        setTimeout(() => this.successMessage = '', 3000);
        // ↑ Clear success message after 3 seconds
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to add question.';
      }
    });
  }

  deleteQuestion(question: Question) {
    if (!confirm(`Delete this question? This cannot be undone.`)) return;

    this.apiService.deleteQuestion(question.id).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.id !== question.id);
        // ↑ Remove from local array without re-fetching
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to delete question.';
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'TEXT': '📝 Text',
      'RADIO': '🔘 Radio',
      'CHECKBOX': '☑️ Checkbox',
      'SELECT': '📋 Select'
    };
    return labels[type] || type;
    // ↑ Friendly display labels for question types
  }

  goBack() {
    this.router.navigate(['/host']);
  }
  // ── New Edit Methods ─────────────────────────────

  onEditTypeChange(type: string) {
    while (this.editOptions.length) this.editOptions.removeAt(0);
    if (type !== 'TEXT') {
      this.addEditOption();
      this.addEditOption();
    }
  }

  addEditOption() {
    this.editOptions.push(this.fb.control('', Validators.required));
  }

  removeEditOption(index: number) {
    if (this.editOptions.length <= 2) {
      this.errorMessage = 'Must have at least 2 options.';
      return;
    }
    this.editOptions.removeAt(index);
  }

  startEdit(question: Question) {
    this.editingQuestionId = question.id;
    this.isAdding = false;
    // ↑ Close add form if open
    this.errorMessage = '';

    // Pre-populate edit form with existing question data
    this.editForm.patchValue({
      question_text: question.question_text,
      type: question.type
      // ↑ patchValue updates specific fields without
      //   resetting the entire form — unlike setValue
      //   which requires ALL fields to be provided
    });

    // Rebuild options array from existing options
    while (this.editOptions.length) this.editOptions.removeAt(0);
    if (question.options && question.options.length > 0) {
      question.options.forEach(opt => {
        this.editOptions.push(this.fb.control(opt, Validators.required));
        // ↑ Pre-fill each option with existing value
      });
    }
  }

  cancelEdit() {
    this.editingQuestionId = null;
    this.editForm.reset();
    this.errorMessage = '';
    // ↑ Clear edit state without saving
  }

  onUpdate(question: Question) {
    if (this.editForm.invalid) return;

    this.isUpdating = true;
    this.errorMessage = '';

    const { question_text, type } = this.editForm.value;
    const optionsValue = type === 'TEXT'
      ? undefined
      : this.editOptions.controls.map(c => c.value);

    this.apiService.updateQuestion(question.id, {
      question_text,
      type,
      options: optionsValue
    }).subscribe({
      next: (res: any) => {
        // Update the question in local array
        const index = this.questions.findIndex(q => q.id === question.id);
        if (index !== -1) {
          this.questions[index] = res.question;
          // ↑ Replace old question with updated one from API
          //   Keeps local state in sync with database
        }
        this.editingQuestionId = null;
        this.isUpdating = false;
        this.successMessage = 'Question updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to update question.';
        this.isUpdating = false;
      }
    });
  }
}
```

- at manage-questions.component.html, add the following code:
  _to be added later_
- at manage-questions.component.css, add the following code:
  _to be added later_

#### 7. Implement Results Component Typescript, HTML, CSS

- at results.component.ts, add the following code:

```Typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
// ↑ Adjust path to match your actual api.service.ts location

interface QuestionResult {
  question_text: string;
  type: 'TEXT' | 'RADIO' | 'CHECKBOX' | 'SELECT';
  counts: Record<string, number>;
  // ↑ Record<string, number> means an object where
  //   keys are strings and values are numbers
  //   e.g. { "Never": 5, "Rarely": 3, "Often": 2 }
  total_selections_counted: number;
  text_responses: string[];
}

interface SurveyResults {
  survey_title: string;
  total_submissions: number;
  results: Record<string, QuestionResult>;
  // ↑ Record<string, QuestionResult> because the API
  //   returns question_id as the key:
  //   { "1": { question_text: ..., counts: ... }, "2": { ... } }
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {
  surveyId!: number;
  data: SurveyResults | null = null;
  isLoading = true;
  errorMessage = '';

  // Converts results object into a sorted array for *ngFor
  // Angular templates can't iterate over plain objects directly
  questionEntries: { id: string; result: QuestionResult }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('surveyId'));
    this.loadResults();
  }

  loadResults() {
    this.apiService.getSurveyResults(this.surveyId).subscribe({
      next: (res: SurveyResults) => {
        this.data = res;
        this.questionEntries = Object.entries(res.results).map(
          ([id, result]) => ({ id, result })
        );
        // ↑ Object.entries() converts:
        //   { "1": {...}, "2": {...} }
        //   into:
        //   [ { id: "1", result: {...} }, { id: "2", result: {...} } ]
        //   So *ngFor can iterate over it
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load results.';
        this.isLoading = false;
      }
    });
  }

  // Converts counts object to sorted array for bar chart rendering
  getCountEntries(counts: Record<string, number>): { label: string; count: number }[] {
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
    // ↑ Sort descending so highest count appears first
  }

  // Calculates bar width as percentage of total for visual bar chart
  getBarWidth(count: number, counts: Record<string, number>): number {
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    // ↑ reduce() sums all count values
    return total === 0 ? 0 : Math.round((count / total) * 100);
    // ↑ Returns percentage 0-100 for CSS width
  }

  isChoiceType(type: string): boolean {
    return ['RADIO', 'CHECKBOX', 'SELECT'].includes(type);
    // ↑ Helper to determine if question has countable options
  }

  goBack() {
    this.router.navigate(['/host']);
  }
}
```

#### 8. Add navigation and button for results page

- at dashboard.component.ts, add the following method to navigate to results page:

```Typescript
...
...
viewResults(surveyId: number) {
  this.router.navigate(['/host/results', surveyId]);
}
...
...
```

- at dashboard.component.html, add a "View Results" button for each survey that navigates to the results page:

```html
... ...
<div class="survey-actions">
  <button class="btn-outline" (click)="manageQuestions(survey.id)">
    Questions
  </button>

  <!-- Only show Results button if survey is published -->
  <button
    *ngIf="survey.is_published"
    class="btn-results"
    (click)="viewResults(survey.id)"
  >
    View Results
  </button>

  <button
    *ngIf="!survey.is_published"
    class="btn-toggle"
    (click)="togglePublish(survey)"
    [disabled]="togglingId === survey.id"
  >
    {{ togglingId === survey.id ? '...' : 'Publish' }}
  </button>

  <span *ngIf="survey.is_published" class="published-lock"> 🔒 Published </span>

  <button class="btn-danger" (click)="deleteSurvey(survey)">Delete</button>
</div>
... ...
```

#### 10. Route Components

- at app.routes.ts, add the following code to route the host dashboard, create survey, manage questions, and results components:

```Typescript
import { DashboardComponent } from './features/host/dashboard/dashboard.component';
import { CreateSurveyComponent } from './features/host/create-survey/create-survey.component';
import { ManageQuestionsComponent } from './features/host/manage-questions/manage-questions.component';
import { ResultsComponent } from './features/host/results/results.component';

...
...
{ path: 'host', component: DashboardComponent, canActivate: [authGuard, hostGuard] },
{ path: 'host/create', component: CreateSurveyComponent, canActivate: [authGuard, hostGuard] },
{
  path: 'host/manage/:surveyId',
  component: ManageQuestionsComponent,
  canActivate: [authGuard, hostGuard]
},
{
  path: 'host/results/:surveyId',
  component: ResultsComponent,
  canActivate: [authGuard, hostGuard]
},
...
{ path: '**', redirectTo: '' }, // this must be the last route as it catches all unmatched paths
```

### Create Modal Component

#### 1. Generate Modal Component

```bash
ng generate component shared/components/confirm-modal
ng generate service core/services/modal
```

#### 2. Implement Modal Service

- at modal.service.ts, add the following code to implement the modal service (open/close, execute/cancel actions):

```Typescript
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  // ↑ Optional — defaults to 'Confirm'
  cancelLabel?: string;
  danger?: boolean;
  // ↑ true = red confirm button (for destructive actions)
}

@Injectable({ providedIn: 'root' })
export class ModalService {

  // Subject that ConfirmModalComponent listens to
  // for when to show itself and what to display
  private openSubject = new Subject<ModalConfig>();
  open$ = this.openSubject.asObservable();
  // ↑ Modal component subscribes to this to know when to appear

  // Subject that the CALLER listens to
  // for whether user clicked Confirm or Cancel
  private resultSubject = new Subject<boolean>();

  confirm(config: ModalConfig): Observable<boolean> {
    this.openSubject.next(config);
    // ↑ Emit config to modal component — it shows itself

    return this.resultSubject.asObservable();
    // ↑ Return observable the caller subscribes to
    //   It will emit true (confirm) or false (cancel)
  }

  resolve(result: boolean) {
    this.resultSubject.next(result);
    // ↑ Called by modal component when user clicks a button
    //   Emits result back to whoever called confirm()
  }
}
```

#### 3. Implement Confirm Modal Component Typescript, HTML, CSS

- at confirm-modal.component.ts, add the following code to implement the confirm modal component:

```Typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalConfig } from '../../../core/services/modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  config: ModalConfig = {
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    danger: false
  };

  private subscription!: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.subscription = this.modalService.open$.subscribe(config => {
      this.config = {
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        danger: false,
        ...config
        // ↑ Spread operator merges defaults with provided config
        //   So caller only needs to pass what's different
      };
      this.isVisible = true;
      // ↑ Show modal when service emits a config
    });
  }

  onConfirm() {
    this.isVisible = false;
    this.modalService.resolve(true);
    // ↑ Tell the caller: user clicked Confirm
  }

  onCancel() {
    this.isVisible = false;
    this.modalService.resolve(false);
    // ↑ Tell the caller: user clicked Cancel
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // ↑ Always unsubscribe in ngOnDestroy to prevent
    //   memory leaks — Angular equivalent of
    //   React's useEffect cleanup return function
  }
}
```

- at confirm-modal.component.html, add the following code:
  _to be added later_
- at confirm-modal.component.css, add the following code:
  _to be added later_

#### 4. Register Modal to App Component

- at app.component.html, add the following code to register the confirm modal component so it can be used across the app:

```html
<app-navbar />
<router-outlet />
<app-confirm-modal />
<!-- ↑ Placed here at the very end so it's available globally across all routes — same idea as React putting a Modal at the root App level -->
```

- at app.component.ts, import the ConfirmModalComponent so Angular knows about it:

```Typescript
...
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
...
...
  imports: [... ConfirmModalComponent],
...
...
```

#### 5. Implement Modal Usage Example

- When necessary, implement the modal in the following example:

````Typescript
// 1. need to import
import { ModalService } from '../../../core/services/modal.service';
...
// 2. Add to constructor
constructor(
...
  private modalService: ModalService
  // ↑ Inject ModalService
) {}
...
someFunction(someExplicitVariable: someInterface){
  ...
  ...
  this.modalService.confirm({
    title: 'some Title',
    message: `some message with ${someExplicitVariable.name}`,
    confirmLabel: 'Yes, Publish',
    cancelLabel: 'Cancel',
    danger: false
  }).subscribe((confirmed) => {
    // ↑ Subscribe to get user's choice
    if (!confirmed) return;
    // ↑ User clicked Cancel — do nothing
    // the remaining code will be executed only if user clicked Confirm
    ...
    ...
    ...
  })
```

## Notes/Annotation ### Import - api.service.ts ```typescript import {

Injectable } from "@angular/core"; // ↑ Injectable: marks this class as
something Angular's dependency injection system can create and share. // Without
this, you can't inject it into components. import { HttpClient } from
"@angular/common/http"; // ↑ HttpClient: Angular's built-in tool for making HTTP
requests (GET, POST, PUT, DELETE). // Like axios or fetch, but Angular-native.
import { Observable } from "rxjs"; // ↑ Observable: a stream that emits data
over time. Think of it like a Promise, but more powerful — // it can emit
multiple values and be cancelled. HttpClient returns Observables for all
requests. @Injectable({ providedIn: "root" }) // ↑ This decorator registers the
service globally. 'root' means one single shared instance exists // across your
entire app (singleton pattern). export class ApiService { private baseUrl =
"http://localhost:3000/api"; // ↑ Centralised base URL — change once, updates
everywhere. 'private' means only this class can access it. constructor(private
http: HttpClient) {} // ↑ Angular automatically injects HttpClient here.
'private' shorthand also declares it as a class property. getSurveys():
Observable<any>
{ // ↑ Return type is Observable<any>
— telling TypeScript "this method returns a stream of data, type unknown for
now." // Later you'd replace 'any' with a proper interface. return
this.http.get(`${this.baseUrl}/surveys`); } }</any

> </any

````

- home.component.ts

```typescript
import { Component, OnInit } from "@angular/core";
// ↑ Component: decorator that marks this class as an Angular component (a reusable UI building block).
//   OnInit: a lifecycle interface — lets you run code exactly once when the component first loads.

import { CommonModule } from "@angular/common";
// ↑ Provides common Angular template features like: *ngIf (show/hide elements), *ngFor (loop over arrays),
//   and the 'json' pipe you used in the template.
//   Required in standalone components — older Angular had this built in via BrowserModule.

import { ApiService } from "../../services/api.service";
// ↑ Importing your own service to use in this component.

@Component({
  selector: "app-home",
  // ↑ The HTML tag name for this component.
  //   Use <app-home /> anywhere to render it.

  standalone: true,
  // ↑ Angular 17 default — means this component manages
  //   its own imports directly, no NgModule needed.

  imports: [CommonModule],
  // ↑ Standalone components declare their own dependencies.
  //   CommonModule gives access to *ngFor, *ngIf, json pipe etc.

  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  // ↑ 'implements OnInit' is a contract — TypeScript enforces
  //   that you must define an ngOnInit() method below.

  surveys: any[] = [];
  // ↑ Class property to hold survey data.
  //   Initialised as empty array so template doesn't crash
  //   before data loads.

  constructor(private apiService: ApiService) {}
  // ↑ Angular injects your ApiService here automatically.
  //   Don't call 'new ApiService()' manually — Angular
  //   handles that. This is dependency injection.

  ngOnInit() {
    // ↑ Runs once when component loads — the right place
    //   for data fetching. Don't fetch data in constructor.
    this.apiService.getSurveys().subscribe({
      // ↑ Observables are lazy — nothing happens until
      //   you .subscribe(). This is what triggers the HTTP call.

      next: (data: any) => (this.surveys = data),
      // ↑ 'next' runs when data arrives successfully.
      //   Assigns API response to your surveys property,
      //   which automatically updates the template.

      error: (err) => console.error("API error:", err),
      // ↑ 'error' runs if the request fails.
      //   Always handle errors — silent failures are hard to debug.
    });
  }
}
```

### Create Insight Modal

#### 1. Generate Insight Modal Component

```bash
ng generate component shared/components/insight-modal
```

#### 2. Implement Insight Modal Component Typescript, HTML, CSS

- at insight-modal.component.ts, add the following code to implement the insight modal component:

```Typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// ↑ This modal uses @Input/@Output pattern instead of a service
//   because it's simpler for display-only modals —
//   no need for a Subject/Observable when we just need
//   to show content and close

@Component({
  selector: 'app-insight-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insight-modal.component.html',
  styleUrl: './insight-modal.component.css'
})
export class InsightModalComponent {
  @Input() isVisible = false;
  // ↑ Parent controls visibility by passing true/false

  @Input() summary = '';
  // ↑ The AI summary text to display

  @Input() submissionCount = 0;
  @Input() generatedAt = '';
  // ↑ Metadata to show alongside the summary

  @Input() isLoading = false;
  // ↑ Shows loading state while API call is in flight

  @Output() close = new EventEmitter<void>();
  // ↑ Emits to parent when user wants to close
  //   void means no data needs to be passed back

  onClose() {
    this.close.emit();
  }

  // Converts markdown-style **bold** to readable text
  // since the AI returns markdown formatting
  formatSummary(text: string): string {
    return text
      .replace(/### /g, '')
      .replace(/## /g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // ↑ Strips markdown symbols for plain display
      //   In a real app you'd use a markdown renderer library
      .replace(/\\n/g, '\n');
  }

  // Split summary into paragraphs for better readability
  getParagraphs(text: string): string[] {
    return this.formatSummary(text)
      .split('\n')
      .filter(line => line.trim().length > 0);
      // ↑ Split by newline, remove empty lines
  }
}
```

- at insight-modal.component.html, add the following code:

```html
<div class="modal-backdrop" *ngIf="isVisible" (click)="onClose()">
  <div class="modal-box" (click)="$event.stopPropagation()">
    <!-- Header -->
    <div class="modal-header">
      <div class="modal-title-row">
        <span class="modal-icon">🤖</span>
        <h2>AI Survey Insights</h2>
      </div>
      <button class="btn-close" (click)="onClose()">✕</button>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Generating insights...</p>
      <p class="loading-sub">AI is analysing your survey responses</p>
    </div>

    <!-- Content -->
    <div *ngIf="!isLoading" class="modal-content">
      <!-- Meta Info -->
      <div class="insight-meta">
        <span class="meta-item">
          📊 Based on {{ submissionCount }} submissions
        </span>
        <span class="meta-item" *ngIf="generatedAt">
          🕐 {{ generatedAt | date: 'dd MMM yyyy, HH:mm' }}
        </span>
        <!-- ↑ Angular's built-in date pipe formats the
                date string into readable format
                'dd MMM yyyy, HH:mm' = "18 Jun 2026, 16:13" -->
      </div>

      <!-- Summary Paragraphs -->
      <div class="summary-body">
        <p
          *ngFor="let paragraph of getParagraphs(summary)"
          class="summary-paragraph"
          [class.section-header]="paragraph.startsWith('#') || paragraph.endsWith(':')"
        >
          {{ paragraph }}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="modal-footer" *ngIf="!isLoading">
      <button class="btn-close-footer" (click)="onClose()">Close</button>
    </div>
  </div>
</div>
```

- at insight-modal.component.css, add the following code:
  _to be added later_

#### 3. Wire Insight Modal to Results Component Typescript, HTML, CSS

- at results.component.ts, add the following code to integrate the insight modal:

```typescript
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService, InsightsResponse } from "../../../services/api.service";
import { InsightModalComponent } from "../../../shared/components/insight-modal/insight-modal.component";
// ↑ Adjust paths to match your structure

@Component({
  selector: "app-results",
  standalone: true,
  imports: [CommonModule, InsightModalComponent],
  // ↑ Add InsightModalComponent to imports
  templateUrl: "./results.component.html",
  styleUrl: "./results.component.css",
})
export class ResultsComponent implements OnInit {
  // ... existing properties unchanged ...

  // New insight modal properties
  showInsightModal = false;
  insightSummary = "";
  insightSubmissionCount = 0;
  insightGeneratedAt = "";
  isInsightLoading = false;

  // ... existing constructor and methods unchanged ...

  generateInsight() {
    this.showInsightModal = true;
    this.isInsightLoading = true;
    // ↑ Open modal immediately and show loading spinner
    //   while API call is in flight

    this.apiService.getSurveyInsights(this.surveyId).subscribe({
      next: (res: InsightsResponse) => {
        this.insightSummary = res.insights.summary;
        this.insightSubmissionCount = res.insights.submission_count;
        this.insightGeneratedAt = res.insights.createdAt;
        this.isInsightLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || "Failed to generate insights.";
        this.showInsightModal = false;
        this.isInsightLoading = false;
      },
    });
  }

  closeInsightModal() {
    this.showInsightModal = false;
  }
}
```

- at results.component.html, add the following code to integrate the insight modal:

```html
<!-- Replace the Generate Insight stat card -->
<div class="stat-card clickable" (click)="generateInsight()">
  <span class="stat-icon">🤖</span>
  <span class="stat-label">Generate Insight</span>
</div>

<!-- Add at the very bottom of the template -->
<app-insight-modal
  [isVisible]="showInsightModal"
  [summary]="insightSummary"
  [submissionCount]="insightSubmissionCount"
  [generatedAt]="insightGeneratedAt"
  [isLoading]="isInsightLoading"
  (close)="closeInsightModal()"
>
</app-insight-modal>
<!-- ↑ [] = Input binding (passing data IN to child)
        () = Output binding (receiving events FROM child)
        This is the Angular @Input/@Output pattern in action -->
```

- at results.component.css, add the following code:

```css
.stat-card.clickable {
  cursor: pointer;
  transition: all 0.2s;
  border-color: #4f46e5;
}

.stat-card.clickable:hover {
  background: #eef2ff;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.8rem;
  margin-bottom: 4px;
}
```

#### Optional: Use Markdown Renderer for Insight Modal

**Instead of stripping markdown formatting, you can use a library like `ngx-markdown` to render the AI summary with proper formatting (bold, headings, lists, etc.). This would involve installing the library and updating the modal template to use `<markdown [data]="summary"></markdown>`.**

- Install the package:

```bash
npm install ngx-markdown@17 --legacy-peer-deps
npm install marked@9 --legacy-peer-deps
```

- at insight-modal.component.ts, import and configure the MarkdownModule:

```typescript
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-insight-modal',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  // ↑ Add MarkdownModule here
  ...
  ...
  // ❌ No longer needed — delete these
formatSummary(text: string): string { ...
}
getParagraphs(text: string): string[] { ... }


})
```

- at insight-modal.component.html, replace the summary display (paragraph loop) with:

```html
<!-- ❌ Remove your current paragraph loop -->
<div class="summary-body">
  <p *ngFor="let paragraph of getParagraphs(summary)" class="summary-paragraph">
    {{ paragraph }}
  </p>
</div>

<!-- ✅ Replace with this single line -->
<div class="summary-body">
  <markdown [data]="summary" class="markdown-content"></markdown>
  <!-- ↑ ngx-markdown handles ALL the parsing and rendering
          headers, bold, bullets, horizontal rules — everything -->
</div>
```

- at insight-modal.component.css, add styles to ensure the rendered markdown looks good:

```css
.markdown-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 20px 0 8px;
}

.markdown-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 8px;
}

.markdown-content ul {
  padding-left: 20px;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.markdown-content li {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #374151;
}

.markdown-content strong {
  color: #4f46e5;
  font-weight: 600;
}

.markdown-content p {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #374151;
  margin-bottom: 8px;
}

.markdown-content hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}

.markdown-content ol {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.markdown-content ol li {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #374151;
}
```

- at app.config.ts, add the following code to set up marked options for ngx-markdown:

```typescript
import { provideMarkdown } from "ngx-markdown";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideMarkdown(),
    // ↑ Registers markdown renderer globally
  ],
};
```

### Create Profile Page

#### 1. Generate Profile Component

```bash ng generate

component features/profile

```

#### 2. Implement Profile Component Typescript, HTML, CSS

- at profile.component.ts, add the following code to implement the profile component:

```Typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { ApiService } from '../../services/api.service';
// ↑ Adjust path to your actual api.service.ts location

interface Tier {
  name: string;
  label: string;
  // ↑ name = 'Bronze', label = '🥉 Bronze'
  minPoints: number;
  maxPoints: number;
  // ↑ maxPoints is the threshold for NEXT tier
  //   Platinum has no max so we use Infinity
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUser: AuthUser | null = null;
  surveysCompleted = 0;
  isLoading = true;

  // Define all tiers in order
  tiers: Tier[] = [
    {
      name: 'Bronze',
      label: '🥉 Bronze',
      minPoints: 0,
      maxPoints: 100,
      color: '#92400e',
      bgColor: '#fef3c7'
    },
    {
      name: 'Silver',
      label: '🥈 Silver',
      minPoints: 100,
      maxPoints: 300,
      color: '#374151',
      bgColor: '#f3f4f6'
    },
    {
      name: 'Gold',
      label: '🥇 Gold',
      minPoints: 300,
      maxPoints: 700,
      color: '#92400e',
      bgColor: '#fef9c3'
    },
    {
      name: 'Platinum',
      label: '💎 Platinum',
      minPoints: 700,
      maxPoints: Infinity,
      // ↑ Infinity means no upper limit — once platinum, always platinum
      color: '#1e40af',
      bgColor: '#dbeafe'
    }
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Fetch public surveys to count completed ones
    this.apiService.getSurveys().subscribe({
      next: (res: any) => {
        // Count surveys where the completed badge would show
        // We use the same /surveys/public endpoint
        // For now we show total published surveys as context
        this.surveysCompleted = res.surveys?.length || 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // ── Tier Calculation Methods ─────────────────────────

  get points(): number {
    return this.currentUser?.points_bal ?? 0;
  }

  get currentTier(): Tier {
    // Find the highest tier the user qualifies for
    return [...this.tiers]
      .reverse()
      .find(t => this.points >= t.minPoints) || this.tiers[0];
    // ↑ Reverse so we check from highest to lowest
    //   First match = current tier
  }

  get nextTier(): Tier | null {
    const currentIndex = this.tiers.findIndex(
      t => t.name === this.currentTier.name
    );
    return currentIndex < this.tiers.length - 1
      ? this.tiers[currentIndex + 1]
      : null;
    // ↑ Returns null if user is already Platinum (max tier)
  }

  get progressToNextTier(): number {
    if (!this.nextTier) return 100;
    // ↑ Already at max tier — show full bar

    const pointsIntoCurrentTier = this.points - this.currentTier.minPoints;
    const tierRange = this.nextTier.minPoints - this.currentTier.minPoints;
    return Math.round((pointsIntoCurrentTier / tierRange) * 100);
    // ↑ Calculate % progress within current tier
    //   e.g. 150pts in Silver (100-300):
    //   pointsIntoTier = 150 - 100 = 50
    //   tierRange = 300 - 100 = 200
    //   progress = 50/200 * 100 = 25%
  }

  get pointsToNextTier(): number {
    if (!this.nextTier) return 0;
    return this.nextTier.minPoints - this.points;
    // ↑ Simple subtraction — how many more points needed
  }
}
```

#### 3. Add Route and Navigation

- at app.routes.ts, add the following code to route the profile component:

```Typescript
import { ProfileComponent } from './features/profile/profile.component';

// Add before ** wildcard
{ path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
```

- at navbar.component.html, add the following code to add a link to the profile page:

```html
<a routerLink="/profile" class="nav-link">My Profile</a>
```

### Create Admin Dashboard

#### 1. Generate Admin Dashboard Component

```bash
ng generate component features/admin/dashboard
ng generate guard core/guards/admin
```

#### 2. Implement Admin Guard

- at admin.guard.ts, add the following code to implement the admin guard:

```Typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
```

#### 3. Add API service for ADMIN Dashboard

- at api.service.ts, add the following code to implement the API call for admin dashboard:

```Typescript
// Admin survey interfaces
export interface AdminSurvey {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
  created_by: string;
  creator: {
    uuid: string;
    name: string;
    email: string;
    role: string;
  };
}

// Add these methods to ApiService
getAdminSurveys(): Observable<any> {
  return this.http.get(`${this.baseUrl}/surveys/admin`);
}

adminTogglePublish(surveyId: number, isPublished: boolean): Observable<any> {
  return this.http.patch(
    `${this.baseUrl}/surveys/${surveyId}/toggle`,
    { is_published: isPublished }
  );
}
```

#### 4. Add route and navigation

- at app.routes.ts, add the following code to route the admin dashboard component:

```Typescript
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard.component';
import { adminGuard } from './core/guards/admin.guard';

// Add before ** wildcard
{
  path: 'admin',
  component: AdminDashboardComponent,
  canActivate: [authGuard, adminGuard]
},
```

#### 5. Implement Admin Dashboard Component Typescript, HTML, CSS

- at dashboard.component.ts, add the following code to implement the admin dashboard component:

```Typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AdminSurvey } from '../../../services/api.service';
import { ModalService } from '../../../core/services/modal.service';

// ↑ Adjust paths to match your actual file locations

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // ↑ FormsModule needed for [(ngModel)] on search input
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  surveys: AdminSurvey[] = [];
  filteredSurveys: AdminSurvey[] = [];
  // ↑ Two arrays — surveys holds originals,
  //   filteredSurveys holds search results
  //   This way we never lose original data when filtering

  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  togglingId: number | null = null;

  // Filter options
  filterStatus: 'all' | 'published' | 'draft' = 'all';

  constructor(
    private apiService: ApiService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSurveys();
  }

  loadSurveys() {
    this.isLoading = true;
    this.apiService.getAdminSurveys().subscribe({
      next: (res: any) => {
        this.surveys = res.surveys;
        this.filteredSurveys = res.surveys;
        // ↑ Both start with full list
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load surveys.';
        this.isLoading = false;
      }
    });
  }

  // ── Search & Filter ──────────────────────────────────

  onSearch() {
    this.applyFilters();
  }

  setFilter(status: 'all' | 'published' | 'draft') {
    this.filterStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.surveys];

    // Apply search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.creator.name.toLowerCase().includes(term) ||
        s.creator.email.toLowerCase().includes(term)
        // ↑ Search by title, host name, or host email
      );
    }

    // Apply status filter
    if (this.filterStatus === 'published') {
      result = result.filter(s => s.is_published);
    } else if (this.filterStatus === 'draft') {
      result = result.filter(s => !s.is_published);
    }

    this.filteredSurveys = result;
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  // ── Admin Actions ────────────────────────────────────

  unlockSurvey(survey: AdminSurvey) {
    this.modalService.confirm({
      title: 'Unlock Survey',
      message: `Unlock "${survey.title}"? The host will be able to edit and delete it again.`,
      confirmLabel: 'Yes, Unlock',
      cancelLabel: 'Cancel',
      danger: false
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.togglingId = survey.id;
      this.apiService.adminTogglePublish(survey.id, false).subscribe({
        next: (res: any) => {
          survey.is_published = false;
          // ↑ Update local state immediately
          this.togglingId = null;
          this.successMessage = `"${survey.title}" has been unlocked.`;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.msg || 'Failed to unlock survey.';
          this.togglingId = null;
        }
      });
    });
  }

  publishSurvey(survey: AdminSurvey) {
    this.modalService.confirm({
      title: 'Publish Survey',
      message: `Publish "${survey.title}"?`,
      confirmLabel: 'Yes, Publish',
      cancelLabel: 'Cancel',
      danger: false
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.togglingId = survey.id;
      this.apiService.adminTogglePublish(survey.id, true).subscribe({
        next: (res: any) => {
          survey.is_published = true;
          this.togglingId = null;
          this.successMessage = `"${survey.title}" has been published.`;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.msg || 'Failed to publish survey.';
          this.togglingId = null;
        }
      });
    });
  }

  // ── Stats Helpers ────────────────────────────────────

  get totalSurveys(): number {
    return this.surveys.length;
  }

  get publishedCount(): number {
    return this.surveys.filter(s => s.is_published).length;
  }

  get draftCount(): number {
    return this.surveys.filter(s => !s.is_published).length;
  }
}
```

#### Note: Add Link to Dropdown Menu

- at navbar.component.html, add the following code to add a link to the admin dashboard in the dropdown menu:

```html
<a
  *ngIf="currentUser.role === 'ADMIN'"
  routerLink="/admin"
  class="dropdown-item"
  (click)="closeDropdown()"
>
  🛡️ Admin Panel
</a>
```

### Create Landing Page

#### 1. Generate Landing Component

```bash
ng generate component features/landing
```

#### 2. Update Route for landing page and navbar

- at app.routes.ts, change the default route to point to the landing page:

```Typescript
import { LandingComponent } from './features/landing/landing.component';
// Change the default route to LandingComponent
export const routes: Routes = [
  { path: '', component: LandingComponent },
  // ↑ Landing page is now the default public route
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  // ↑ Survey list moved to /home
  ...other routes...
];
```

#### 3. Implement Landing Component Typescript, HTML, CSS

- at landing.component.ts, add the following code to implement the landing component:

```Typescript
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  goToApp() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/register']);
    }
  }

  // Tier data for the rewards section
  tiers = [
    {
      name: 'Bronze',
      icon: '🥉',
      points: '0 – 100 pts',
      color: 'from-amber-600 to-amber-400',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      perks: ['Access all surveys', 'Earn points per survey', 'View your responses']
    },
    {
      name: 'Silver',
      icon: '🥈',
      points: '100 – 300 pts',
      color: 'from-slate-500 to-slate-300',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      perks: ['All Bronze perks', 'Priority survey access', 'Weekly digest']
    },
    {
      name: 'Gold',
      icon: '🥇',
      points: '300 – 700 pts',
      color: 'from-yellow-500 to-yellow-300',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      perks: ['All Silver perks', 'Bonus point surveys', 'Gold member badge']
    },
    {
      name: 'Platinum',
      icon: '💎',
      points: '700+ pts',
      color: 'from-cyan-500 to-teal-400',
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      perks: ['All Gold perks', 'Exclusive surveys', 'Top of leaderboard']
    }
  ];

  // How it works steps
  steps = [
    {
      number: '01',
      icon: '📝',
      title: 'Register & Join',
      desc: 'Create your free account in seconds. Choose to join as a Survey Taker or Survey Host.'
    },
    {
      number: '02',
      icon: '✅',
      title: 'Complete Surveys',
      desc: 'Browse published community surveys and share your opinions on topics that matter.'
    },
    {
      number: '03',
      icon: '⭐',
      title: 'Earn Points',
      desc: 'Every completed survey credits points to your account. Watch your tier climb.'
    }
  ];

  // Features
  features = [
    {
      icon: '🎯',
      title: 'Gamified Rewards',
      desc: 'Earn points for every survey completed. Climb through Bronze, Silver, Gold and Platinum tiers.'
    },
    {
      icon: '📊',
      title: 'Host Analytics',
      desc: 'Survey hosts get real-time visual results with bar charts and response breakdowns.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Insights',
      desc: 'Our AI analyses your survey responses and generates structured trend reports automatically.'
    },
    {
      icon: '🔒',
      title: 'Fraud Detection',
      desc: 'Every text response is screened by AI to ensure data quality and authentic feedback.'
    },
    {
      icon: '👥',
      title: 'Role-Based Access',
      desc: 'Separate experiences for Survey Takers, Hosts, and Admins — everyone gets the right tools.'
    },
    {
      icon: '🇸🇬',
      title: 'Built for Singapore',
      desc: 'Designed with Singapore community topics in mind — transport, food, lifestyle and more.'
    }
  ];
}
```

- at landing.component.html, add the following code to implement the landing component template:

```html
<div class="min-h-screen bg-white">
  <!-- ─── NAVBAR ──────────────────────────────────── -->
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100"
  >
    <!-- ↑ fixed: stays at top while scrolling
       bg-white/90: 90% opaque white
       backdrop-blur-sm: blurs content behind navbar
       z-50: above everything else -->
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <a routerLink="/" class="flex items-center">
        <span
          class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400 bg-clip-text text-transparent"
        >
          AOInsights
        </span>
        <!-- ↑ bg-gradient-to-r: gradient left to right
             bg-clip-text: clips gradient to text shape
             text-transparent: makes text show gradient instead of color -->
      </a>

      <!-- Nav Links -->
      <div class="flex items-center gap-6">
        <a
          href="#how-it-works"
          class="text-sm text-gray-500 hover:text-teal-500 transition-colors"
        >
          How it works
        </a>
        <a
          href="#features"
          class="text-sm text-gray-500 hover:text-teal-500 transition-colors"
        >
          Features
        </a>
        <a
          href="#tiers"
          class="text-sm text-gray-500 hover:text-teal-500 transition-colors"
        >
          Rewards
        </a>
        <a
          routerLink="/login"
          class="text-sm text-gray-600 hover:text-teal-600 font-medium transition-colors"
        >
          Sign In
        </a>
        <a
          routerLink="/register"
          class="text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Get Started
        </a>
      </div>
    </div>
  </nav>

  <!-- ─── HERO SECTION ────────────────────────────── -->
  <section
    class="pt-32 pb-24 px-6 bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50"
  >
    <!-- ↑ pt-32: padding top 128px (clears fixed navbar)
       bg-gradient-to-br: gradient bottom-right direction -->
    <div class="max-w-4xl mx-auto text-center">
      <!-- Eyebrow tag -->
      <div
        class="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-cyan-200"
      >
        <!-- ↑ inline-flex: shrink-wraps the badge to content
             rounded-full: pill shape -->
        <span>🇸🇬</span>
        <span>Singapore's Community Survey Platform</span>
      </div>

      <!-- Main Logo / Wordmark -->
      <h1 class="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
        <!-- ↑ md:text-7xl: larger on medium+ screens (responsive)
             tracking-tight: tighter letter spacing -->
        <span
          class="bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400 bg-clip-text text-transparent"
        >
          AOInsights
        </span>
      </h1>

      <!-- Tagline -->
      <p class="text-xl md:text-2xl text-gray-600 mb-4 font-light">
        your
        <span class="font-semibold text-cyan-600">Automated Opinions</span>
        <span class="text-gray-400"> into </span>
        <span class="font-semibold text-teal-600">Insights</span>
      </p>
      <!-- ↑ Breaking the tagline so AO and I are highlighted
              making the AOI acronym subtly visible -->

      <!-- Sub tagline -->
      <p class="text-gray-400 text-base mb-10 max-w-xl mx-auto">
        Complete community surveys, earn points, climb tiers — while hosts get
        AI-powered analytics on every response.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <!-- ↑ flex-col on mobile, flex-row on sm+ screens -->
        <button
          (click)="goToApp()"
          class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl text-base hover:opacity-90 transition-all hover:scale-105"
        >
          <!-- ↑ hover:scale-105: slight zoom on hover -->
          {{ isLoggedIn ? 'Go to Dashboard →' : 'Start Earning Points →' }}
        </button>
        <a
          routerLink="/login"
          class="px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl text-base border-2 border-teal-200 hover:border-teal-400 transition-all hover:scale-105"
        >
          Sign In
        </a>
      </div>

      <!-- Social proof -->
      <p class="mt-8 text-xs text-gray-400">
        Free to join · No credit card required · Earn points from day one
      </p>
    </div>
  </section>

  <!-- ─── HOW IT WORKS ─────────────────────────────── -->
  <section id="how-it-works" class="py-24 px-6 bg-white">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-3">How it works</h2>
        <p class="text-gray-400 text-base">
          Three simple steps to start earning
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- ↑ 1 column mobile, 3 columns on md+ -->

        <div
          *ngFor="let step of steps"
          class="relative p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group"
        >
          <!-- ↑ group: lets child elements react to parent hover
               transition-all: smooth animation on all properties -->

          <!-- Step number -->
          <span
            class="text-5xl font-black text-gray-50 group-hover:text-teal-50 transition-colors absolute top-6 right-6"
          >
            {{ step.number }}
          </span>
          <!-- ↑ Huge faint step number in background
               group-hover: changes color when parent is hovered -->

          <!-- Icon -->
          <div class="text-4xl mb-4">{{ step.icon }}</div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-800 mb-2">{{ step.title }}</h3>

          <!-- Description -->
          <p class="text-gray-400 text-sm leading-relaxed">{{ step.desc }}</p>

          <!-- Bottom accent line -->
          <div
            class="mt-6 h-1 w-12 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full group-hover:w-full transition-all duration-500"
          ></div>
          <!-- ↑ Animated underline that expands on hover
               duration-500: 500ms transition -->
        </div>
      </div>
    </div>
  </section>

  <!-- ─── FEATURES ─────────────────────────────────── -->
  <section
    id="features"
    class="py-24 px-6 bg-gradient-to-br from-slate-50 to-cyan-50"
  >
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-3">
          Everything you need
        </h2>
        <p class="text-gray-400 text-base">
          Built for both survey takers and hosts
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- ↑ 1 col → 2 col → 3 col as screen grows -->

        <div
          *ngFor="let feature of features"
          class="bg-white p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
        >
          <div class="text-3xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-base font-bold text-gray-800 mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            {{ feature.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── TIER REWARDS ─────────────────────────────── -->
  <section id="tiers" class="py-24 px-6 bg-white">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-3">Earn your way up</h2>
        <p class="text-gray-400 text-base">
          Complete surveys to unlock higher tiers and exclusive perks
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          *ngFor="let tier of tiers; let i = index"
          class="rounded-2xl border-2 p-6 text-center transition-all hover:scale-105"
          [ngClass]="tier.bgColor + ' ' + tier.borderColor"
        >
          <!-- ↑ [ngClass] dynamically applies CSS classes
               from your tier data objects -->

          <!-- Icon -->
          <div class="text-5xl mb-3">{{ tier.icon }}</div>

          <!-- Tier name -->
          <h3 class="text-xl font-bold mb-1" [ngClass]="tier.textColor">
            {{ tier.name }}
          </h3>

          <!-- Points range -->
          <p
            class="text-xs font-semibold text-gray-400 mb-4 bg-white/60 rounded-full px-3 py-1 inline-block"
          >
            {{ tier.points }}
          </p>

          <!-- Perks list -->
          <ul class="text-left space-y-2">
            <!-- ↑ space-y-2: adds vertical gap between list items -->
            <li
              *ngFor="let perk of tier.perks"
              class="text-xs text-gray-600 flex items-center gap-2"
            >
              <span class="text-teal-500 font-bold">✓</span>
              {{ perk }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── FINAL CTA ─────────────────────────────────── -->
  <section
    class="py-24 px-6 bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500"
  >
    <!-- ↑ Full-width vibrant gradient CTA section -->
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-4xl font-extrabold text-white mb-4">
        Ready to share your opinions?
      </h2>
      <p class="text-cyan-100 text-base mb-10">
        Join AOInsights today — it's free, it's rewarding, and your voice
        matters.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          (click)="goToApp()"
          class="px-8 py-4 bg-white text-teal-600 font-bold rounded-xl text-base hover:bg-gray-50 transition-all hover:scale-105"
        >
          {{ isLoggedIn ? 'Go to Dashboard →' : 'Join AOInsights →' }}
        </button>
        <a
          routerLink="/login"
          *ngIf="!isLoggedIn"
          class="px-8 py-4 bg-transparent text-white font-semibold rounded-xl text-base border-2 border-white/50 hover:border-white transition-all hover:scale-105"
        >
          Already have an account?
        </a>
      </div>
    </div>
  </section>

  <!-- ─── FOOTER ────────────────────────────────────── -->
  <footer class="py-8 px-6 bg-gray-900">
    <div
      class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <span
        class="text-lg font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent"
      >
        AOInsights
      </span>

      <p class="text-gray-500 text-xs">
        © 2026 AOInsights · Automated Opinion Insight · Built in Singapore 🇸🇬
      </p>

      <div class="flex gap-6">
        <a
          routerLink="/login"
          class="text-gray-500 hover:text-teal-400 text-xs transition-colors"
        >
          Sign In
        </a>
        <a
          routerLink="/register"
          class="text-gray-500 hover:text-teal-400 text-xs transition-colors"
        >
          Register
        </a>
      </div>
    </div>
  </footer>
</div>
```

- at landing.component.css, add the following code to implement the landing component styles:

```css
/* Smooth scroll for anchor links */
:host {
  scroll-behavior: smooth;
}

/* Hide the main navbar on landing page
   since landing has its own nav */
:host-context(app-root) app-navbar {
  display: none;
}
```

#### 4. Update App Component to use Landing Page

- at app.component.ts, adjust the default content with the following code to use the landing page (you need to hide the navbar on the landing page):

```Typescript
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ConfirmModalComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.showNavbar = e.url !== '/';
      // ↑ Hide navbar only on landing page (root route)
      //   Show it on all other pages
    });
  }
}
```

- at app.component.html, replace the default content with the following code to use the landing page:

```html
<app-navbar *ngIf="showNavbar" />
<router-outlet />
<app-confirm-modal />
```

## Angular vs React Notes

### Create Component

- React: Just write a function that returns JSX. No special syntax needed.

```jsx
function Home() {
  return <h1>Home</h1>;
}
```

- Angular: Various steps:
  - Use Angular CLI to generate a component with `ng generate component`. This gives you a .ts file (logic), .html file (template), and .css file (styles).
  - Use the @Component decorator to define metadata, and export a class. The template can be inline or in a separate HTML file.

```typescript
import { Component } from "@angular/core";
@Component({
  selector: "app-home",
  template: `<h1>Home</h1>`,
})
export class HomeComponent {}
```

### Pass Data to Child

- React: Just pass props like normal function arguments.

```jsx
function Home({ title }) {
  const [data, setData] = useState(null);
  return (
    <div>
      <someComponent title={title} data={data} />
    </div>
  );
}
```

- Angular: use @Input() for parent-to-child, @Output() + EventEmitter for child-to-parent, and services for sibling communication.

```typescript
// somecomponent.component.ts
export class SomeComponent {
  @Input() title: string = "";
  @Input() points: number = 0;
  // ↑ @Input() is Angular's equivalent of props
}
```

```typecript
// somecomponent.component.html
<app-somecomponent [title]="component.title" [points]="component.points" />
```

### Emitting Events

- React: Just call a function passed down as a prop.

```jsx
function SomeComponent({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
}
```

- Angular: Use @Output() and EventEmitter to emit events from child to parent.

```typescript
import { Component, Output, EventEmitter } from "@angular/core";
@Component({
  selector: "app-somecomponent",
  template: `<button (click)="handleClick()">Click me</button>`,
})
export class SomeComponent {
  @Output() clicked = new EventEmitter<void>();
  handleClick() {
    this.clicked.emit();
  }
}
```

```html
<!-- parent.component.html -->
<app-somecomponent (clicked)="onChildClicked()" />
```
