import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  showLoading(): void {
    this.loadingSubject.next(true);
  }

  hideLoading(): void {
    this.loadingSubject.next(false);
  }
}
