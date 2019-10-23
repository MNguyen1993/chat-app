const socket = io();

// Elements from DOM
const $form = document.querySelector('form');

// Templates
const dropdownTemplate = document.querySelector('#dropdownTemplate').innerHTML;

socket.on('activeLobbies', ({ lobbies }) => {
	lobbies.forEach(element => {
		console.log(element);
	});

	const html = Mustache.render(dropdownTemplate, { lobbies });
	$form.insertAdjacentHTML('beforebegin', html);
});
