const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const {
	generateMessage,
	generateLocationMessage
} = require('./utils/messages');
const {
	addUser,
	removeUser,
	getUser,
	getUsersInLobby
} = require('./utils/users');
const { addLobby, removeLobby } = require('./utils/lobbies');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const filter = new Filter();

const port = process.env.PORT;

app.use(express.static('public'));

io.on('connection', socket => {
	console.log('New WebSocket connection');

	socket.emit('activeLobbies');

	socket.on('join', (userInfo, cb) => {
		const { error, user } = addUser({ id: socket.id, ...userInfo });

		if (error) {
			return cb(error);
		}

		addLobby(user.lobby);

		socket.join(user.lobby);

		socket.emit('message', generateMessage('Admin', 'Welcome'));
		socket.broadcast
			.to(user.lobby)
			.emit(
				'message',
				generateMessage('Admin', `${user.username} has joined!`)
			);
		io.to(user.lobby).emit('lobbyData', {
			lobby: user.lobby,
			users: getUsersInLobby(user.lobby)
		});

		cb();
	});

	socket.on('sendMessage', (msg, cb) => {
		const user = getUser(socket.id);

		if (filter.isProfane(msg)) {
			return cb('Profanity is not allowed!');
		}

		io.to(user.lobby).emit('message', generateMessage(user.username, msg));
		cb();
	});

	socket.on('shareLocation', (loc, cb) => {
		const user = getUser(socket.id);

		if (!loc) {
			return cb('Location was not receieved');
		}

		io.to(user.lobby).emit(
			'locationMessage',
			generateLocationMessage(
				user.username,
				`https://google.com/maps?q=${loc.latitude},${loc.longitude}`
			)
		);
		cb();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.lobby).emit(
				'message',
				generateMessage('Admin', `${user.username} has left`)
			);
			io.to(user.lobby).emit('lobbyData', {
				lobby: user.lobby,
				users: getUsersInLobby(user.lobby)
			});
		}

		removeLobby(user.lobby);
	});
});

server.listen(port, () => {
	console.log(`Server is online on port ${port}`);
});
