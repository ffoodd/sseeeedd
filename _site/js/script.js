(() => {
	"use strict";

	// Toggle switch component
	const switches = document.querySelectorAll('[role="switch"]');
	switches.forEach(button => {
		button.addEventListener('click', () => {
			const checked = button.getAttribute('aria-checked') === 'true' || false;
			button.setAttribute('aria-checked', !checked);
		});
	});

	// Scrollable tables
	const regions = document.querySelectorAll('.table-container');
	if (window.matchMedia('(min-width: 30em)').matches) {
		regions.forEach(region => {
			const width = region.offsetWidth;
			const table = region.querySelector('table');

			if (table.offsetWidth > width) {
				region.setAttribute('tabindex', '0');
			}
		});
	}

	// Open dialogs
	const openers = document.querySelectorAll('.dialog-opener');
	openers.forEach(button => {
		const dialog = button.nextElementSibling;
		if (dialog.nodeName === 'DIALOG') {
			button.addEventListener('click', () => {
				dialog.showModal();
			})
		}
	});

	// Range inputs
	const ranges = document.querySelectorAll('[type="range"]');
	ranges.forEach(range => {
		const output = range.parentNode.querySelector('output');
		range.addEventListener('input', () => {
			range.style.setProperty('--value', `${range.value}%`);
			output.style.setProperty('--value', range.value);
			output.value = range.value;
		});

		document.addEventListener('DOMContentLoaded', () => {
			range.style.setProperty('--value', `${range.value}%`);
			output.style.setProperty('--value', range.value);
			output.value = range.value;
		});
	})



})(document);
