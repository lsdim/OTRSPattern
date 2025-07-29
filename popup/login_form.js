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
    
    try {
        const authToken = await getToken();
        if (!authToken.idToken) {
            throw new Error("Authentication failed");
        }

        const BotTokenUrl = 'https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/info/TelegramBot.json';
        const UserSettingsUrl = `https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/user_settings/${user.username}.json`;

        const [botTokenResponse, userSettingsResponse] = await Promise.all([
            fetch(BotTokenUrl + `?auth=${authToken.idToken}`),
            fetch(UserSettingsUrl + `?auth=${authToken.idToken}`)
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