async function getToken() {

	let token = {};
	await getData('token').then(value => {
		token = value ? { ...value } : {};
	});

	if (token.expiresIn) {
		const dateExp = new Date(token.expiresIn);
		if (new Date() > dateExp) {
			console.log('Token expired');
			token = await login();
		} else {
			console.log('token.expiresIn', token.expiresIn);
		}
	} else {
		token = await login();
	}

	return token;

}

async function login() {
	let user = {};
	await getData('user').then(value => {
		if (value) {
			user = { ...value };
		}
	});

	if (!user.username || !user.password) {
		alert('Не вказано логін або пароль');
		return {};
	}
    const apiKey = await getData('apiKey');
    const AuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

	const data = {
		email: `${user.username}@ukrposhta.ua`,
		password: user.password,
		returnSecureToken: true
	};

	let loginData = {};
	await runPost(AuthUrl, data).then(response => {
		loginData = { ...response };
	});

	if (loginData.error) {
		alert(loginData.error.message);
		return {};
	}

	const dateExp = new Date(new Date().getTime() + +loginData.expiresIn * 1000);
	const token = {
		idToken: loginData.idToken,
		expiresIn: dateExp.toString()
	};
	await setData('token', token);

	return token;

}

async function runPost(url, data) {

	try {
		const responseID = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			mode: 'cors',
			body: JSON.stringify(data)
		});
		if (!responseID.ok) {
            const errorBody = await responseID.json();
            const errorMessage = errorBody.error.message || `HTTP error! status: ${responseID.status}`;
            throw new Error(errorMessage);
		}

		const json = await responseID.json();
		return json;

	} catch (error) {
		console.error('There has been a problem:', error);
        throw error;
	}
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
	return gettingItem[key];

}

async function setData(key, value) {
	try {
		await browser.storage.local.set({ [key]: value });
	} catch (error) {
		console.error(`Error setting ${key} to storage:`, error);
	}

}