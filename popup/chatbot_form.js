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
    await syncUserSettings({ chatId: chatId.value, botId: botId.value });
  } else {
    alert("Налаштування збережено локально. Увійдіть в систему та вкажіть API ключ, щоб синхронізувати їх.");
  }
  await setData('chatBot', chatBot);
  alert("Збережено!");
});

async function syncUserSettings(settings) {
    const user = await getData('user');
    const UserSettingsUrl = `https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/user_settings/${user.username}.json`;

    try {
        const authToken = await getToken();
        if (!authToken.idToken) {
            throw new Error("Authentication failed");
        }

        const response = await fetch(UserSettingsUrl + `?auth=${authToken.idToken}`, {
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