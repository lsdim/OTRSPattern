
document.querySelectorAll('.menu a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

const chatbotForm = document.getElementById('chatbotForm');

const chatId = document.getElementById("chatId");
const botId = document.getElementById("botId");


 getData('chatId').then(value => {
		if (value) {
			chatId.value = value;
		}
        
		getData('botId').then(value => {
			if (value) {
				botId.value = value;
			}			
		});
 });

    


chatbotForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  

  if (chatId.value == "" || botId.value == "") {
    alert("Заповніть обидва поля!");
  } else {
	  
	  //changeIcon();
	  setData(chatId.value, botId.value);
	  alert("Збережено!");

  }
  
  console.log('submit');

  // handle submit
});

/*
browser.pageAction.onClicked.addListener((tab) => {
	console.log('pageAction');
  browser.pageAction.setIcon({
    tabId: tab.id,
    path: {
		19: "icons/otrs-19.png",
		38: "icons/otrs-38.png"
	},
  });
});

async function changeIcon() {
	let settingIcon = await browser.pageAction.setIcon({
  path: {
    19: "icons/otrs-19.png",
	38: "icons/otrs-38.png"
  },
});

};

*/

async function setData(chatId, botId) {
	try {
            await browser.storage.local.set({ 'chatId': chatId, 'botId': botId });
        } catch (error) {
            console.error('Error setting tickets to storage:', error);
        }
		console.log('set');
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
    console.log('gettingItem', gettingItem[key]);
    return gettingItem[key];

}

function setItem() {
  console.log("OK");
}

function onError(error) {
  console.log(error);
}