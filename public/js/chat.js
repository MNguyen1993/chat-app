const socket = io();

// Elements from dom, convention is to use preceeding $
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $shareLocationBtn = document.querySelector('#shareLocation');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationURLTemplate = document.querySelector('#urlTemplate').innerHTML;
const sideBarTemplate = document.querySelector('#sidebarTemplate').innerHTML;

// Options
const { username, lobby } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

const autoScroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// Height of new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container
	const containerHeight = $messages.scrollHeight;

	// Scroll position
	// how far from the top we scrolled (scrollTop)
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

$messageForm.addEventListener('submit', event => {
	event.preventDefault();

	$messageFormBtn.setAttribute('disabled', 'disabled');

	const messageToBeSent = $messageFormInput.value;

	socket.emit('sendMessage', messageToBeSent, err => {
		$messageFormBtn.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if (err) {
			return console.log(err);
		}
		console.log('Message delivered');
	});
});

$shareLocationBtn.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browswer');
	}

	$shareLocationBtn.setAttribute('disabled', 'disabled');

	// is async but does not support promise api
	navigator.geolocation.getCurrentPosition(position => {
		socket.emit(
			'shareLocation',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			},
			() => {
				console.log('Location shared');
				$shareLocationBtn.removeAttribute('disabled');
			}
		);
	});
});

socket.on('activeLobbies', () => {
	console.log('Recieved active lobbies');
});

socket.on('message', svrMsgObj => {
	const html = Mustache.render(messageTemplate, {
		message: svrMsgObj.text,
		createdAt: moment(svrMsgObj.createdAt).format('h:mm a'),
		username: svrMsgObj.username
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('locationMessage', locMsgObj => {
	console.log(locMsgObj);
	const html = Mustache.render(locationURLTemplate, {
		url: locMsgObj.url,
		createdAt: moment(locMsgObj.createdAt).format('h:mm a'),
		username: locMsgObj.username
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('lobbyData', ({ lobby, users }) => {
	const html = Mustache.render(sideBarTemplate, {
		lobby,
		users
	});
	$sidebar.innerHTML = html;
});

socket.emit('join', { username, lobby }, err => {
	if (err) {
		alert(err);
		location.href = '/';
	}
});
