
document.querySelectorAll('.menu a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

const loginForm = document.getElementById('loginForm');

const username = document.getElementById("username");
const password = document.getElementById("password");


 getData('username').then(value => {
		if (value) {
			username.value = value;
		}
        
		getData('password').then(value => {
			if (value) {
				password.value = value;
			}			
		});
 });

    


loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  

  if (username.value == "" || password.value == "") {
    alert("Заповніть обидва поля!");
  } else {
	  
	  //changeIcon();
	  setData(username.value, password.value);
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

async function setData(username, password) {
	try {
            await browser.storage.local.set({ 'username': username, 'password': password });
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