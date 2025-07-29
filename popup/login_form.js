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

    


loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  

  if (username.value == "" || password.value == "") {
    alert("Заповніть обидва поля!");
  } else {
	  
    user.username = username.value;
	  user.password = password.value;
	  user.isActive = loginActive.checked;
	  setData(user);
	  setDataKey(apiKey.value);
	  alert("Збережено!");

  }
  
  console.log('submit');

});

async function setData(user) {
	try {
            await browser.storage.local.set({ 'user': user });
        } catch (error) {
            console.error('Error setting tickets to storage:', error);
        }
		console.log('set');
}

async function setDataKey(apiKey) {
	try {
            await browser.storage.local.set({ 'apiKey': apiKey });
        } catch (error) {
            console.error('Error setting tickets to storage:', error);
        }
		console.log('set');
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
    //console.log('gettingItem', gettingItem[key]);
    return gettingItem[key];

}