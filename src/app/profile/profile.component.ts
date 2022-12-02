import { Component } from '@angular/core';
import { timer } from 'rxjs';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
	ngOnInit() {
		timer(300).subscribe(() => {
			document.querySelectorAll('.splash-item').forEach((el) => {
				el.classList.remove('hidden');
			});
		});
	}
}
