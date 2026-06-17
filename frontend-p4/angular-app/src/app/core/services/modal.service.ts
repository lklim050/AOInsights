import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ModalConfig {
  title: String;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private openSubject = new Subject<ModalConfig>();
  open$ = this.openSubject.asObservable();

  private resultSubject = new Subject<boolean>();

  confirm(config: ModalConfig): Observable<boolean> {
    this.openSubject.next(config);

    return this.resultSubject.asObservable();
  }
  resolve(result: boolean) {
    this.resultSubject.next(result);
  }
}
