import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent {
	title = 'CV';
	pages: Element[] = [];
	currentPage: number = 0;

	clamp = (num: number, min: number, max: number) =>
		Math.min(Math.max(num, min), max);

	changePage(event: Event) {
		if (event instanceof WheelEvent) {
			if (event.deltaY > 0) {
				this.currentPage += 1;
			} else {
				this.currentPage -= 1;
			}
			this.currentPage = this.clamp(
				this.currentPage,
				0,
				this.pages.length - 1
			);

			this.updatePage();
		}
	}

	updatePage() {
		for (let index = 0; index < this.pages.length; index++) {
			let page: Element = this.pages[index];
			if (index < this.currentPage) {
				page.classList.add('hidden-top');
			} else if (index > this.currentPage) {
				page.classList.add('hidden-bottom');
			} else {
				page.classList.remove('hidden-top', 'hidden-bottom');
			}
		}
	}

	ngOnInit() {
		document.querySelectorAll('.page').forEach((el) => {
			el.classList.add('hidden-bottom');
			this.pages.push(el);
		});
		this.pages[this.currentPage].classList.remove('hidden-bottom');
	}
}
