
const loginForm = document.getElementById('loginForm');

const patternTag = document.getElementById("patternTag");
const patternName = document.getElementById("patternName");
const patternText = document.getElementById("patternText");


const patterns = [
				{tag: 'АРМ ВЗ', pattern: [
					{name: 'Помилка друку принтера з АРМ ВЗ', text: 'Налаштовано формат вихідного паперу'},
					{name: 'Не можна закрити день', text: 'Є ПВ виданні в доставку, термін зберігання яких закінчився'},
				]},

				{tag: 'Pos-terminal', pattern: [
					{name: 'Не працює термінал', text: "Не було з'єднання з терміналом через завислий ЮСБ-хаб \nНалаштовано підключення терміналу через езернет, щоб не бути залежним від ЮСБ-хабу"},
					{name: 'Не працює термінал', text: "Під час спілкування з заявником , останній виконав перезавантаження терміналу – ПОС термінал запрацював."}
				]},
				];
				
for (let i = 0; i<=patterns.length-1; i++){
    let opt = document.createElement('option');
    opt.value = patterns[i].tag;
    opt.innerHTML = patterns[i].tag;
    patternTag.appendChild(opt);
}

getPatternsByTag(patterns);

patternTag.addEventListener("change", (event) => {
	//console.log('patterns', patterns);
	getPatternsByTag(patterns, event.target.value);
});

patternName.addEventListener("change", (event) => {
	console.log('patternName', event.target.value);
	getPatternsByName(patterns, event.target.value);
});

function getPatternsByName(patterns, name) {
	let pattText;
	for (let i=0; i<patterns.length; i++) {
		pattText = patterns[i].pattern.filter((patt)=> patt.name === name);
		if (pattText.length>0) {
			break;
		}
	}
	
	if (pattText.length >0) {
		patternText.innerHTML = pattText[0].text;
	}
	
		
}

function getPatternsByTag(patterns, tag) {
	
	patternName.innerHTML = null;
	
	let newPatterns;
	//console.log('newPatterns1', newPatterns, patterns);
	//console.log('tag', tag);
	
	if (tag) {
		newPatterns = patterns.filter((patt) =>(patt.tag === tag));
	} else {
		newPatterns = patterns;
	};
	
	//console.log('newPatterns2', newPatterns, patterns);
	
	for (let i = 0; i<newPatterns.length; i++){
		for (let j = 0; j<newPatterns[i].pattern.length; j++) {
			let opt = document.createElement('option');
			opt.value = newPatterns[i].pattern[j].name;
			opt.innerHTML = newPatterns[i].pattern[j].name;
			patternName.appendChild(opt);
			
			if (i==0 && j == 0) {
				getPatternsByName(newPatterns, newPatterns[i].pattern[j].name)
			}
		}		
	}
}



/*

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

*/