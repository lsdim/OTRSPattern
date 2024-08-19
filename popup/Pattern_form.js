
const DBUrl = 'https://otrs-patterns-default-rtdb.europe-west1.firebasedatabase.app/patterns.json';


const loginForm = document.getElementById('loginForm');

const patternTag = document.getElementById("patternTag");
const patternName = document.getElementById("patternName");
const patternText = document.getElementById("patternText");



/*const patterns = [
				{tag: 'АРМ ВЗ', pattern: [
					{name: 'Помилка друку принтера з АРМ ВЗ', text: 'Налаштовано формат вихідного паперу'},
					{name: 'Не можна закрити день', text: 'Є ПВ виданні в доставку, термін зберігання яких закінчився'},
				]},

				{tag: 'Pos-terminal', pattern: [
					{name: 'Не працює термінал', text: "Не було з'єднання з терміналом через завислий ЮСБ-хаб \nНалаштовано підключення терміналу через езернет, щоб не бути залежним від ЮСБ-хабу"},
					{name: 'Не працює термінал', text: "Під час спілкування з заявником , останній виконав перезавантаження терміналу – ПОС термінал запрацював."}
				]},
				{tag: 'Інтернет	', pattern: [
					{name: 'Відсутня мережа інтернет по всьому відділенні 1', text: 'інтернет перевірено, працює стабільно'},
					{name: 'Відсутня мережа інтернет по всьому відділенні 2', text: 'перезавантажте обладнання провайдера, інтернет працює'},
					{name: 'Відсутня мережа інтернет по всьому відділенні 3', text: 'перезавантажено обладнання провайдера, інтернет не запрацюював. Перевірено працездатність резервного інтернету, ........'},
					{name: 'Відсутня мережа інтернет по всьому відділенні 4', text: 'Перед ввімкненням ПК необхідно переконатись у тому, що інтернет-обладнання вже запустилось. На даний момент інтернет перевірено, працює стабільно.'}
				]}
	 
				];
				
*/

//const patterns = 
setValues();

async function setValues() {
	
	const patterns = await getPatternsFromDB(DBUrl);

	//const patterns = Object.values(newPatterns);
	//console.log('newPatterns', newPatterns);
	
	
	fillPattertTag(patterns)

	getPatternsByTag(patterns);
	
	patternTag.addEventListener("change", (event) => {
		//console.log('patterns', patterns);
		getPatternsByTag(patterns, event.target.value);
	});

	patternName.addEventListener("change", (event) => {
		//console.log('patternName', event.target.value);
		getPatternsTextByName(patterns, event.target.value, patternTag.value);
	});
	
	//return patterns;
}	

function fillPattertTag(patterns) {
		for (const key in patterns){
		let opt = document.createElement('option');
		//console.log('patterns['+key+']',patterns[key]);
		opt.value = key;
		opt.innerHTML = patterns[key].tag;
		patternTag.appendChild(opt);
	}
}

//*********************************

//console.log('patterns',patterns);

//*********************************
/*for (let i = 0; i<=patterns.length-1; i++){
		let opt = document.createElement('option');
		console.log('patterns[i]',patterns[i]);
		opt.value = patterns[i].tag;
		opt.innerHTML = patterns[i].tag;
		patternTag.appendChild(opt);
	}

	getPatternsByTag(patterns);
*/

/*
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
*/

/*
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
*/

function getPatternsTextByName(patterns, id, tag) {

	//console.log('getPatternsByName', patterns);
	if (!tag) {
		for (const key in patterns) {
			if (Object.keys(patterns[key].pattern).includes(id)) {
				patternText.innerHTML = patterns[key].pattern[id].text;
				return;
			}
		}
	} else {
		patternText.innerHTML = patterns[tag].pattern[id].text;
	}
	
}

function getPatternsByTag(patterns, tag) {
	
	patternName.innerHTML = null;
	
	let newPatterns;
	//console.log('newPatterns1', newPatterns, patterns);
	//console.log('tag', tag);
	
	if (tag) {
		newPatterns = {tag: patterns[tag]}; //.filter((patt) =>(patt.tag === tag));
	} else {
		newPatterns = patterns;
	};
	
	//console.log('newPatterns2', newPatterns, patterns);
	let i = 0;
	let j = 0;
	for (const key in newPatterns){
		//console.log('key', key);
		for (const keyPatt in newPatterns[key].pattern) {
			//console.log('keyPatt', keyPatt);
			let opt = document.createElement('option');
			opt.value = keyPatt;
			opt.innerHTML = newPatterns[key].pattern[keyPatt].name;
			patternName.appendChild(opt);
			
			if (i===0 && j === 0) {
				getPatternsTextByName(newPatterns, keyPatt, key);
			}
			
			j++;
		}	
		i++;
	}
}



/*
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
*/

async function getPatternsFromDB(url) {	
    try {
        const responseID = await fetch(url);
        if (!responseID.ok) {
            throw new Error('Network response was not ok for the first fetch');
        }

        const json = await responseID.json();
		//console.log('json', json);
		return json;
        /*const article = getArticleID(htmlID);
		const articleURL = article.url;
		
		//console.log('article', article);

        if (!articleURL) {
            throw new Error('Article URL not found');
        }

		//console.log(`${url}#${articleURL}`);
        const response2 = await fetch(`http://help.ukrposhta.loc${articleURL}`);
        if (!response2.ok) {
            throw new Error('Network response was not ok for the second fetch');
        }

        const html2 = await response2.text();		
        return getArticleText(html2, article.id);
		
		*/
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
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