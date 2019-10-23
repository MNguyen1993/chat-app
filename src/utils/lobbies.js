const lobbies = [];

const { getUsersInLobby } = require('./users');

const addLobby = name => {
	name.trim().toLowerCase();

	if (!name) {
		return {
			error: 'Lobby needs a name to be created'
		};
	}

	const existingLobby = lobbies.find(lobby => lobby === name);

	if (existingLobby) {
		return {
			error: 'Lobby already exists'
		};
	}

	lobbies.push(name);
	return { name };
};

const removeLobby = name => {
	const activeUsers = getUsersInLobby(name);

	if (activeUsers.length === 0) {
		const index = lobbies.findIndex(lobby => lobby === name);

		return lobbies.splice(index, 1)[0];
	}
};

module.exports = {
	addLobby,
	removeLobby,
	lobbies
};
