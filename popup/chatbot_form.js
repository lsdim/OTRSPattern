
document.querySelectorAll('.menu a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

const chatbotForm = document.getElementById('chatbotForm');

const chatActive = document.getElementById("isActive");
const chatId = document.getElementById("chatId");
const botId = document.getElementById("botId");

let chatBot = {};

checkboxChecked();


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
        
		/*getData('botId').then(value => {
			if (value) {
				botId.value = value;
			}			
		});*/
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
  
  //console.log('submit');

  // handle submit
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

async function setData(chatBot) {
	try {
            await browser.storage.local.set({'chatBot': chatBot});
        } catch (error) {
            console.error('Error setting tickets to storage:', error);
        }
		console.log('set');
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
   // console.log('gettingItem', gettingItem[key]);
    return gettingItem[key];

}

