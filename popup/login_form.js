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
      await syncFirebaseSettings();
  }

  alert("Збережено!");
});

async function syncFirebaseSettings() {
    await setData('botTokenStatus', 'LOADING');
    const user = await getData('user');
    const apiKey = await getData('apiKey');

    if (!apiKey || !user || !user.username || !user.password) {
        await setData('botTokenStatus', 'Not configured');
        return;
    }

    const AuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const BotTokenUrl = 'https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/info/TelegramBot.json';
    const UserSettingsUrl = `https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/user_settings/${user.username}.json`;

    try {
        const loginData = await runPost(AuthUrl, {
            email: `${user.username}@ukrposhta.ua`,
            password: user.password,
            returnSecureToken: true
        });

        if (loginData.error) {
            throw new Error(loginData.error.message);
        }
        const authToken = loginData.idToken;

        const [botTokenResponse, userSettingsResponse] = await Promise.all([
            fetch(BotTokenUrl + `?auth=${authToken}`),
            fetch(UserSettingsUrl + `?auth=${authToken}`)
        ]);

        if (!botTokenResponse.ok) {
             throw new Error(`Failed to fetch global bot token: ${botTokenResponse.statusText}`);
        }

        const botTokenData = await botTokenResponse.json();
        const userSettingsData = userSettingsResponse.ok ? await userSettingsResponse.json() : null;

        let chatBot = await getData('chatBot') || {};

        if (botTokenData && botTokenData.BOT_TOKEN) {
            chatBot.botToken = botTokenData.BOT_TOKEN;
            await setData('botTokenStatus', 'LOADED');
        } else {
            await setData('botTokenStatus', 'ERROR: Global BOT_TOKEN not found');
        }

        if (userSettingsData) {
            chatBot.chatId = userSettingsData.chatId;
            chatBot.botId = userSettingsData.botId;
        }

        await setData('chatBot', chatBot);

    } catch (error) {
        console.error('Error syncing Firebase settings:', error);
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
            const errorBody = await responseID.json();
            const errorMessage = errorBody.error.message || `HTTP error! status: ${responseID.status}`;
            throw new Error(errorMessage);
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
