import { Component, HostListener } from '@angular/core';

@Component({
	selector: 'app-skills',
	templateUrl: './skills.component.html',
	styleUrls: ['./skills.component.css'],
})
export class SkillsComponent {
	svg?: HTMLElement;

	@HostListener('window:scroll', ['$event'])
	onScroll(event: Event){
	}

	ngOnInit() {
		this.svg = document.getElementById('phone')??undefined;
	}
}
