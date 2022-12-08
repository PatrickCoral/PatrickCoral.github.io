import { Component, HostListener } from '@angular/core';

@Component({
	selector: 'app-skills',
	templateUrl: './skills.component.html',
	styleUrls: ['./skills.component.css'],
})
export class SkillsComponent {
	observer: IntersectionObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				entry.target.classList.add('shown');
			}
		}
	});

	ngOnInit() {
		document
			.querySelectorAll('.animated')
			.forEach((e) => this.observer.observe(e));
	}
}
