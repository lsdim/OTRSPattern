document.querySelectorAll('.menu a').forEach(link => {
	if (link.href === window.location.href) {
		link.classList.add('active');
	}
});

const DBUrl = 'https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/patterns.json';
let AuthUrl = '';

const loginForm = document.getElementById('loginForm');

const patternTag = document.getElementById("patternTag");
const patternName = document.getElementById("patternName");
const patternText = document.getElementById("patternText");

const loadButton = document.getElementById('loadToServer');
const problemButton = document.getElementById('insertProblem');

const isAddProblem = document.getElementById("isAddProblem");

setValues();

async function setValues() {

	const apiKey = await getData('apiKey');
	AuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

	const patterns = await getPatternsFromDB(DBUrl);

	fillPattertTag(patterns)

	getPatternsByTag(patterns);

	patternTag.addEventListener("change", (event) => {
		getPatternsByTag(patterns, event.target.value);
	});

	patternName.addEventListener("change", (event) => {
		getPatternsTextByName(patterns, event.target.value, patternTag.value);
	});
}

function fillPattertTag(patterns) {
	for (const key in patterns) {
		let opt = document.createElement('option');
		opt.value = key;
		opt.innerHTML = patterns[key].tag;
		patternTag.appendChild(opt);
	}
}

function getPatternsTextByName(patterns, id, tag) {

	if (!tag) {
		for (const key in patterns) {
			if (Object.keys(patterns[key].pattern).includes(id)) {
				patternText.value = patterns[key].pattern[id].text;
				return;
			}
		}
	} else {
		patternText.value = patterns[tag].pattern[id].text;
	}

}

function getPatternsByTag(patterns, tag) {

	patternName.innerHTML = null;

	let newPatterns;

	if (tag) {
		newPatterns = { tag: patterns[tag] };
	} else {
		newPatterns = patterns;
	};

	let i = 0;
	let j = 0;
	for (const key in newPatterns) {
		for (const keyPatt in newPatterns[key].pattern) {
			let opt = document.createElement('option');
			opt.value = keyPatt;
			opt.innerHTML = newPatterns[key].pattern[keyPatt].name;
			patternName.appendChild(opt);

			if (i === 0 && j === 0) {
				getPatternsTextByName(newPatterns, keyPatt, key);
			}

			j++;
		}
		i++;
	}
}



async function getPatternsFromDB(url) {
	try {
		const token = await getToken();
		if (!token.idToken) {
			alert('Не вдалося отримати дані. Перевірте логін і пароль.');
			return;
		}
		url = url + `?auth=${token.idToken}`;
		const responseID = await fetch(url);
		if (!responseID.ok) {
			throw new Error('Network response was not ok for the first fetch');
		}

		const json = await responseID.json();
		return json;

	} catch (error) {
		console.error('There has been a problem with your fetch operation:', error);
	}
}



loadButton.addEventListener("click", (e) => {

	if (!patternTag.value) {
		alert("Виберіть групу!");
		return;
	}

	uploadPatterns(patternTag.value, patternText.value);

});

let ticketText = '';




problemButton.addEventListener("click", clickTicketText);

async function clickTicketText() {
	ticketText = await getTicketText();
	runScript('', ticketText);
	window.close();
}

async function clickPutText() {

	ticketText = await getTicketText();

}

loginForm.addEventListener("submit", (e) => {

	e.preventDefault();

	ticketText = isAddProblem.checked ? ticketText : '';

	runScript(patternText.value, ticketText);

	window.close();
});



function runScript(patternText, ticketText) {
	function reportError(error) {
		console.error(`Неможливо вставити текст: ${error}`);
	}

	browser.tabs.query({ active: true, currentWindow: true })
		.then(sendPutText)
		.catch(reportError);

	function sendPutText(tabs) {
		browser.tabs.sendMessage(tabs[0].id, {
			command: "putText",
			textMessage: patternText,
			ticketMessage: ticketText
		});
	}
}

browser.tabs.executeScript({ file: "/content_script/content_script.js" })
	.then(clickPutText)
	.catch(reportExecuteScriptError);



function reportExecuteScriptError(error) {
	console.error(`Помилка виконання: ${error.message}`);
}


function showLog(message) {
	patternText.value = patternText.value + `\n${message}`;
}

async function uploadPatterns(tag, patternsList) {
	let url = `https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/patterns/${tag}/pattern.json`;

	const token = await getToken();
	if (!token.idToken) {
		alert('Не вдалося завантажити дані. Перевірте логін і пароль.');
		return;
	}
	url = url + `?auth=${token.idToken}`;

	const patternsArray = patternsList.split('@');
	patternText.value = `Завантаження шаблонів ${patternsArray.length} шт.`

	for (let i = 0; i < patternsArray.length; i++) {
		if (patternsArray[i].trim() === '') {
			console.log('Порожній елемент');
			showLog('Порожній шаблон');
			continue;
		};

		const pattern = patternsArray[i].split('$');

		if (pattern.length < 2) {
			showLog(`Неправильний шаблон (${pattern})`);
			continue;
		}

		if (pattern[0].trim() === '' || pattern[1].trim() === '') {
			showLog("Порожнє ім'я або текст");
			console.log("Порожнє ім'я або текст", pattern);
			continue;
		} else {
			const data = {
				name: pattern[0],
				text: pattern[1]
			};

			let uploadData = {};
			await runPost(url, response => {
				uploadData = { ...response };
			});

			console.log('Message sent successfully:', uploadData);
			showLog(`Завантажено шаблон ${uploadData.name}`);
		}

	}
}

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
			console.log('responseID', responseID);
		}

		const json = await responseID.json();
		return json;

	} catch (error) {
		console.error('There has been a problem:', error);
	}
}


async function getTicketText() {
	let txt = '';
	await getData('ticketTextClose').then(value => {
		if (value) {
			txt = `Проблема: <br /> ${value} <br /> <br />`;
		}

	});
	return txt;
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