document.querySelectorAll('.menu a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

const chatbotForm = document.getElementById('chatbotForm');

const chatActive = document.getElementById("isActive");
const chatId = document.getElementById("chatId");
const botId = document.getElementById("botId");
const tokenStatus = document.getElementById("tokenStatus");

let chatBot = {};

checkboxChecked();
updateTokenStatus();

browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.botTokenStatus || changes.chatBot)) {
    updateTokenStatus();
    getData('chatBot').then(value => {
        if (value) {
            chatBot = {...value};
            chatId.value = chatBot.chatId;
            botId.value = chatBot.botId;
        }
    });
  }
});


chatActive.addEventListener("change", () => {
	checkboxChecked();
});

 getData('chatBot').then(value => {
		if (value) {
			chatBot = {...value};
			chatId.value = chatBot.chatId;
			botId.value = chatBot.botId;
			chatActive.checked = chatBot.isActive;
			checkboxChecked();
		}
 });

    


chatbotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const user = await getData('user');
  const apiKey = await getData('apiKey');

  chatBot.chatId = chatId.value;
  chatBot.botId = botId.value;
  chatBot.isActive = chatActive.checked;

  if (apiKey && user && user.username) {
    await syncUserSettings(user, apiKey, { chatId: chatId.value, botId: botId.value });
  } else {
    alert("Налаштування збережено локально. Увійдіть в систему та вкажіть API ключ, щоб синхронізувати їх.");
  }
  await setData('chatBot', chatBot);
  alert("Збережено!");
});

async function syncUserSettings(user, apiKey, settings) {
    const AuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
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

        const response = await fetch(UserSettingsUrl + `?auth=${authToken}`, {
            method: 'PATCH', // Use PATCH to update without overwriting other data
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error('Failed to sync user settings to Firebase');
        }

    } catch (error) {
        console.error('Error syncing user settings:', error);
        alert(`Помилка синхронізації: ${error.message}`);
    }
}

function checkboxChecked() {
	  if (chatActive.checked) {
		chatId.disabled = false;
		botId.disabled = false;
	  } else {
		chatId.disabled = true;
		botId.disabled = true;
	  }
}

async function updateTokenStatus() {
    const status = await getData('botTokenStatus');
    if (status) {
        tokenStatus.textContent = `Статус токена: ${status}`;
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
