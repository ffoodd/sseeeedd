(() => {
	"use strict";

	// A single vertical <details> opened at the same time
	document.addEventListener('DOMContentLoaded', () => {
		const details = document.querySelectorAll('.details-group > details');

		details.forEach((target) => {
			target.addEventListener('click', () => {
				details.forEach((detail) => {
					if (detail !== target) {
						detail.removeAttribute('open');
					}
				});
			});
		});
	});

	// Toggle switch component
	const switches = document.querySelectorAll('[role="switch"]');
	switches.forEach((button) => {
		button.addEventListener('click', () => {
			const checked = this.getAttribute('aria-checked') === 'true' || false;
			this.setAttribute('aria-checked', !checked);
		});
	});

	// Scrollable tables
	const regions = document.querySelectorAll('.table-container');
	if (window.matchMedia('(min-width: 30em)').matches) {
		regions.forEach((region) => {
			const width = region.offsetWidth;
			const table = region.querySelector('table');

			if (table.offsetWidth > width) {
				region.setAttribute('tabindex', '0');
			}
		});
	}
})(document);
