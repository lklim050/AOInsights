## 1. Create Repo at Github

- Many setups are available, but at the start, do the following:
  - Create a new repository at Github, and name it "some-repo-name"
  - Do not initialize the repository with a README, .gitignore, or license
  - Click "Create Repository"
- Add gitignore file (the very first file so that subsequent commits will not include unwanted files)
  - Click "Add file" > "Create new file"
  - Name the file ".gitignore"
  - Add the following content to the file:

    ```
    # Ignore node_modules
    node_modules/

    # Ignore build output
    dist/

    # Ignore environment variables
    .env

    # Ignore log files
    *.log
    ```

  - Scroll and click "Commit new file"

## 2. Clone the Repository to Local Machine (GitHub Desktop)

- Open GitHub Desktop
- Click "File" > "Clone Repository"
- Select the repository you just created from the list
- Choose a local path where you want to clone the repository
- Click "Clone"

## 3. Install dependencies or devdependencies

- Either install dependencies one by one using npm i <dependency-name> or install all dependencies at once using npm i
- If you have a package.json file with all dependencies listed.

## Angular (Road to Angular App Setup Guide)

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

## Notes/Annotation

### Import

- api.service.ts

```typescript
import { Injectable } from "@angular/core";
// ↑ Injectable: marks this class as something Angular's dependency injection system can create and share.
//   Without this, you can't inject it into components.

import { HttpClient } from "@angular/common/http";
// ↑ HttpClient: Angular's built-in tool for making HTTP requests (GET, POST, PUT, DELETE).
//   Like axios or fetch, but Angular-native.

import { Observable } from "rxjs";
// ↑ Observable: a stream that emits data over time. Think of it like a Promise, but more powerful —
//   it can emit multiple values and be cancelled. HttpClient returns Observables for all requests.

@Injectable({ providedIn: "root" })
// ↑ This decorator registers the service globally. 'root' means one single shared instance exists
//   across your entire app (singleton pattern).
export class ApiService {
  private baseUrl = "http://localhost:3000/api";
  // ↑ Centralised base URL — change once, updates everywhere. 'private' means only this class can access it.

  constructor(private http: HttpClient) {}
  // ↑ Angular automatically injects HttpClient here. 'private' shorthand also declares it as a class property.

  getSurveys(): Observable<any> {
    // ↑ Return type is Observable<any> — telling TypeScript "this method returns a stream of data, type unknown for now."
    //   Later you'd replace 'any' with a proper interface.
    return this.http.get(`${this.baseUrl}/surveys`);
  }
}
```

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
