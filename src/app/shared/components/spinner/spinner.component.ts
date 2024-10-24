// spinner.component.ts
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { LoadingService } from '../../services/loading.service';

@Component({
	selector: 'app-spinner',
	template: `
    <div class="overlay" *ngIf="isLoading$ | async">
			<div class="spinner"></div>
		</div>
  `,
	styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
	isLoading$: Observable<boolean>;

	constructor(private loadingService: LoadingService) {
		this.isLoading$ = this.loadingService.isLoading$;
	}
}
