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
  if (area === 'local' && changes.botTokenStatus) {
    updateTokenStatus();
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

    


chatbotForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  

  if (chatActive.checked && (chatId.value == "" || botId.value == "")) {
    alert("Заповніть обидва поля!");
  } else {
	  chatBot.chatId = chatId.value;
	  chatBot.botId = botId.value;
	  chatBot.isActive = chatActive.checked;
	  setData(chatBot);
	  alert("Збережено!");

  }
  
});

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

async function setData(chatBot) {
	try {
            await browser.storage.local.set({'chatBot': chatBot});
        } catch (error) {
            console.error('Error setting tickets to storage:', error);
        }
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
    return gettingItem[key];

}