import { Component, HostListener, ViewChild } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent {
	title = 'CV';
	skillPage?: HTMLElement;
	scrollbar?: HTMLElement;

	scrollPercentage(el: HTMLElement | undefined): number {
		if (el === undefined) return 1;
		return Math.min(
			window.scrollY / (this.skillPage?.clientHeight ?? 1),
			1
		);
	}

	easeFn(x: number): number {
		return Math.min(x * x, 1);
	}

	@HostListener('window:scroll', ['$event'])
	onScroll(event: Event) {
		this.skillPage!.style.opacity = this.easeFn(
			this.scrollPercentage(this.skillPage)
		).toString();

		this.scrollbar!.style.height = `${Math.min(
			(window.scrollY /
				(document.body.offsetHeight - window.innerHeight)) *
				100,
			100
		)}vh`;
	}

	ngOnInit() {
		this.skillPage = document.getElementById('skills') ?? undefined;
		this.scrollbar = document.getElementById('scrollbar') ?? undefined;
	}
}
