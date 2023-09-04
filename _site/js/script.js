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
	});

	// Toggles
	const toggles = document.querySelectorAll('.toggle');
	toggles.forEach(toggle => {
		const buttons = toggle.querySelectorAll('button');
		buttons.forEach(button => {
			button.addEventListener('click', () => {
				for (let button of buttons) {
					button.setAttribute('aria-pressed', 'false');
				}
				button.setAttribute('aria-pressed', 'true');
			});
		});
	});

	// Dark mode
	const switcher = document.getElementById('theme');
	const options = switcher.querySelectorAll('button');
	//// Start with user preference
	const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
	document.documentElement.dataset.theme = (prefersDarkScheme.matches) ? 'dark' : 'light';
	//// Then check for localStorage
	const currentTheme = localStorage.getItem('theme');
	document.documentElement.dataset.theme = (currentTheme === 'dark') ? 'dark' : 'light';
	//// Apply expected theme
	if (document.documentElement.dataset.theme === 'dark') {
		document.querySelector('[data-scheme="dark"]').setAttribute('aria-pressed', 'true');
	} else {
		document.querySelector('[data-scheme="light"]').setAttribute('aria-pressed', 'true');
	}
	//// Finally handle overriding through buttons
	options.forEach(option => {
		option.addEventListener('click', () => {
			document.documentElement.dataset.theme = option.dataset.scheme;
			localStorage.setItem('theme', option.dataset.scheme);
		});
	});

})(document);
