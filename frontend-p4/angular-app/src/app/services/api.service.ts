import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
  id: number;
  survey_id: number;
  question_text: string;
  type: 'TEXT' | 'RADIO' | 'CHECKBOX' | 'SELECT';
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

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5001';

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys/public`);
  }
  getSurveyDetail(surveyId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/surveys/${surveyId}`, {});
  }
  submitSurvey(payload: SubmitPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/responses/submit`, payload);
  }
  getHostSurveys(): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys`);
  }

  createSurvey(title: string, pointsReward: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/surveys`, {
      title,
      points_reward: pointsReward,
      is_published: false,
    });
  }
  updateSurvey(
    surveyId: number,
    data: Partial<{
      title: string;
      points_reward: number;
      is_published: boolean;
    }>,
  ): Observable<any> {
    return this.http.patch(`${this.baseUrl}/surveys/${surveyId}`, data);
  }
  deleteSurvey(surveyId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/surveys/${surveyId}`);
  }

  getSurveyResults(surveyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys/${surveyId}/results`);
  }

  getQuestions(surveyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/questions/survey/${surveyId}`);
  }

  createQuestion(
    surveyId: number,
    questionText: string,
    type: string,
    options?: string[],
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/questions`, {
      survey_id: surveyId,
      question_text: questionText,
      type,
      options: options || null,
    });
  }
  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/questions/${questionId}`);
  }
  // updateQuestion(
  //   questionId: number,
  //   data: Partial<{
  //     question_text?: string;
  //     type?: string;
  //     options?: string[];
  //   }>,
  // ): Observable<any> {
  //   return this.http.patch(`${this.baseUrl}/questions/${questionId}`, data);
  // }

  updateQuestion(
    questionId: number,
    data: {
      question_text?: string;
      type?: string;
      options?: string[];
    },
  ): Observable<any> {
    return this.http.patch(`${this.baseUrl}/questions/${questionId}`, data);
  }
}
