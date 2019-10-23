const users = [];

const addUser = ({ id, username, lobby }) => {
	// Clean the data
	username = username.trim().toLowerCase();
	lobby = lobby.trim().toLowerCase();

	// Validate the data
	if (!username || !lobby) {
		return {
			error: 'Username and lobby are required'
		};
	}

	// Check for existing user
	const existingUser = users.find(user => {
		return user.lobby === lobby && user.username === username;
	});

	// Validate unique username
	if (existingUser) {
		return {
			error: 'Username is in use'
		};
	}

	// Store user
	const user = { id, username, lobby };
	users.push(user);
	return { user };
};

const removeUser = id => {
	const index = users.findIndex(user => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = id => users.find(user => user.id === id);

const getUsersInLobby = lobby => users.filter(user => user.lobby === lobby);

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInLobby
};
