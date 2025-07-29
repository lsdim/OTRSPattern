document.querySelectorAll('.menu a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

const loginForm = document.getElementById('loginForm');

const username = document.getElementById("username");
const password = document.getElementById("password");
const apiKey = document.getElementById("apiKey");
const loginActive = document.getElementById("isActive");

let user = {};


 getData('user').then(value => {
		if (value) {
      user = {...value};
			username.value = user.username;
			password.value = user.password;
			loginActive.checked = user.isActive;
		}
 });
 
 getData('apiKey').then(value => {
		if (value) {
			apiKey.value = value;
		}
 });

    


loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (username.value == "" || password.value == "") {
    alert("Заповніть поля імені користувача та пароля!");
    return;
  }

  user.username = username.value;
  user.password = password.value;
  user.isActive = loginActive.checked;
  await setData('user', user);
  await setData('apiKey', apiKey.value);

  if (apiKey.value) {
      await updateBotToken();
  }

  alert("Збережено!");
});

async function updateBotToken() {
    await setData('botTokenStatus', 'LOADING');
    const user = await getData('user');
    const apiKey = await getData('apiKey');

    if (!apiKey || !user || !user.username || !user.password) {
        await setData('botTokenStatus', 'Not configured');
        return;
    }

    const AuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const DBUrl = 'https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/info/TelegramBot.json';

    try {
        const loginData = await runPost(AuthUrl, {
            email: `${user.username}@ukrposhta.ua`,
            password: user.password,
            returnSecureToken: true
        });

        if (loginData.error) {
            throw new Error(loginData.error.message);
        }

        const url = DBUrl + `?auth=${loginData.idToken}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch bot token');
        }

        const json = await response.json();
        if (json && json.BOT_TOKEN) {
            let chatBot = await getData('chatBot') || {};
            chatBot.botToken = json.BOT_TOKEN;
            await setData('chatBot', chatBot);
            await setData('botTokenStatus', 'LOADED');
        } else {
            throw new Error('BOT_TOKEN not found in response');
        }
    } catch (error) {
        console.error('Error updating bot token:', error);
        await setData('botTokenStatus', `ERROR: ${error.message}`);
    }
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
            throw new Error(`HTTP error! status: ${responseID.status}`);
        }
        return await responseID.json();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error;
    }
}

async function setData(key, value) {
	try {
            await browser.storage.local.set({ [key]: value });
        } catch (error) {
            console.error(`Error setting ${key} to storage:`, error);
        }
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
    return gettingItem[key];

}
