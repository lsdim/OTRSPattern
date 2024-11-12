
console.log('start');

const user = {};

const dev_chat = '-4228417669';
const prod_chat = '-4267367123';

const BOT_TOKEN = '7255647619:AAH0dKnIaCsFRx7Dg2qyezOWuum4ItZBkec';
const CHAT_ID = dev_chat;


//document.body.style.border = "2px solid red";
let columns = getColumns();


/*
copy the selected text to clipboard
*/
function copySelection() {
    let selectedText = window.getSelection().toString().trim();

    if (selectedText) {
        document.execCommand("Copy");
    }
}

/*
Add copySelection() as a listener to mouseup events.
*/
//document.addEventListener("mouseup", copySelection);


//**********************************************************************************************
//const intervalID = setInterval(checkNewTicket, 60000, columns);
modTicket(columns);

async function delay() {
	
	const tmp = document.getElementsByClassName('Loading');
	await new Promise(resolve => setTimeout(resolve, 200));
	if (tmp.length>0) {
		await delay();
	}
	
	
	return;
}


async function modTicket(columns) {
	
	await delay();
	
	//console.log('modTicket');
	
    const now = new Date();
    const minute = now.getMinutes();
    const hours = now.getHours();
	
	if (checkDialog()) {
		console.log('checkDialog');
		window.location.reload();
		return;
	}
	
	if (checkNetError()) {
		console.log('checkNetError');
		window.location.reload();
		return;
	}
	

    if (checkLogin()) {
		
		try {
			const gettingItem = await browser.storage.local.get('username');
			user.username = gettingItem.username ? gettingItem.username : '';
		} catch (error) {
			console.error('Error getting username from storage:', error);
		}
		
		try {
			const gettingItem = await browser.storage.local.get('password');
			user.password = gettingItem.password ? gettingItem.password : '';
		} catch (error) {
			console.error('Error getting password from storage:', error);
		}
		
		//console.log('user', user.username);
		//console.log('password', user.password);
		
		const loginError = getLoginError();
		console.log('loginError', loginError);
		
		if (user.username != '' && user.password != '') {
			login();
		}
		
        if (hours >= 8 && hours < 21) {						
            if ([5, 20, 35, 50].includes(minute)) {
				if (loginError) {
					sendMessage('<blockquote>' + loginError + '</blockquote>\t\n' + getAnswer(answersLogin));
				} else {
					sendMessage(getAnswer(answersLogin));
				}				
                
            }
        }
        return;
    }
	
	
	if (!isDashboard()) {
		return;
	}

    const rows = document.getElementsByClassName("MasterAction");

    const ticketNumId = columns.findIndex(el => el === 'TicketNumber');
    const createdId = columns.findIndex(el => el === 'Створено');
    const ageId = columns.findIndex(el => el === 'Відкрита');
    const titleId = columns.findIndex(el => el === 'Заголовок');
    const stateId = columns.findIndex(el => el === 'Стан');
    const ownerId = columns.findIndex(el => el === 'Власник');
    const customerNameId = columns.findIndex(el => el === "Ім'я клієнта");
    const ticketTagId = columns.findIndex(el => el === 'Тег заявки');
    const queueId = columns.findIndex(el => el === 'Черга');
	
	let customers = [];
	
	await getData('customers').then(value => {
			customers = value ? [...value] : [];			
	 });


	let ticketsBlock = [];	
	
	 await getData('ticketsBlock').then(value => {
			ticketsBlock = value ? [...value] : [];			
	 });

		document.querySelectorAll('.Pagination a').forEach(link => {
			//console.log('link',link);
			link.addEventListener('click', function () {
				modTicket(columns);			
			});
		});
	
	

    if (rows.length > 0) {
		
		if (customers.length>0 || ticketsBlock.length>0) {
			for (let i = 0; i < rows.length; i++) {			
				const customer = getInnerText(rows[i],customerNameId);
				const ticketNum = getInnerText(rows[i],ticketNumId);
				const ticketState = getInnerText(rows[i], stateId);
				
				//console.log('customers', customers, customer, customers.includes(customer));			
				
				customers.forEach( cust => {
					if (customer.toUpperCase().indexOf(cust.toUpperCase())>=0) {
						
						rows[i].querySelectorAll('td').forEach(td => {
							td.style.backgroundColor = '#28a745';
							td.style.color = 'white';
						});
						
					}
				})
				
				if (ticketsBlock.includes(ticketNum)) {		

					if (ticketState === 'Призначена') {
						const ticketURL = getTicketURL(rows[i], ticketNumId);;
						const block = await blockTicket(ticketURL);
						if (block) {							
							ticketsBlock.splice(ticketsBlock.indexOf(ticketNum),1);
							await updTiketBlock(rows[i], '#fec33e', 'white', ticketsBlock);
						} else {
							ticketsBlock.splice(ticketsBlock.indexOf(ticketNum),1);
							await updTiketBlock(rows[i], 'rgb(236, 144, 115)', 'white', ticketsBlock);
						}
					} else {
						ticketsBlock.splice(ticketsBlock.indexOf(ticketNum),1);
						await updTiketBlock(rows[i], 'rgb(236, 144, 115)', 'white', ticketsBlock);
					}					
				}
				
			}
		}
		
		
		
        for (let i = 0; i < rows.length; i++) {
            const ticketURL = getTicketURL(rows[i], ticketNumId);
            const ticketText = await getTicketText(ticketURL); // Асинхронний виклик
				
			setTitleText(rows[i], ticketNumId, ticketText);
        }

    }
	

}


///************************************************************************************************












//const intervalID = setInterval(checkNewTicket, 60000, columns);



/*async function checkNewTicket(columns) {
	
	const now = new Date();
	const minute = now.getMinutes();
	const hours  = now.getHours()
	
	if (checkLogin()) {
		if (hours >= 8 && hours < 21) {						
			if (minute === 05 || minute === 20 || minute === 35 || minute === 50) {
				sendMessage(getAnswerLogin());
			}
		}
		return;
	}
	
	
	
	const rows = document.getElementsByClassName("MasterAction");


	/*
	0: "Пріоритет"​
	1: "Нове повідомлення"​
	2: "TicketNumber"​
	3: "Створено"​
	4: "Відкрита"​
	5: "Заголовок"​
	6: "Стан"​
	7: "Власник"​
	8: "Ім'я клієнта"​
	9: "Тег заявки"​
	10: "Черга"
	*/
	
/*	
	const ticketNumId = columns.findIndex(el => el === 'TicketNumber');
	const createdId = columns.findIndex(el => el === 'Створено');
	const ageId = columns.findIndex(el => el === 'Відкрита');
	const titleId = columns.findIndex(el => el === 'Заголовок');
	const stateId = columns.findIndex(el => el === 'Стан');
	const ownerId = columns.findIndex(el => el === 'Власник');
	const customerNameId = columns.findIndex(el => el === "Ім'я клієнта");
	const ticketTagId = columns.findIndex(el => el === 'Тег заявки');
	const queueId = columns.findIndex(el => el === 'Черга');

	//console.log('columns',columns);




	//console.log(rows);

	/*const tmp = getTickets();
	let tickets = [];
	tmp.tickets ? tickets = [...tmp.tickets] : console.log('tmp',tmp);
	*/
/*
	let tickets = [];

		let gettingItem = browser.storage.local.get('tickets');
		 gettingItem.then(tck => {
			 
			 tck.tickets ? tickets = [...tck.tickets] : console.log('tck',tck);
			 
			 console.log('tickets', tickets);		 
			 
			 
			 if (rows) {
				if (rows.length>0) {
					for (let i=0; i<rows.length; i++) {					
						if (tickets.findIndex(ticket => ticket === getInnerText(rows[i],ticketNumId)) === -1 && getInnerText(rows[i],stateId) === 'Призначена') {
							tickets.push(getInnerText(rows[i],ticketNumId));
							console.log('tickets - ' + i, tickets);
							
							
							const ticketURL = getTicketURL(rows[i], ticketNumId);
							
							getArticleID(ticketURL);
								
							console.log('tcktText end');
							
						/*	sendMessage(
							'<tg-emoji emoji-id="5368324170671202286">🚨</tg-emoji>' +columns[ticketNumId] 
							+ '<tg-emoji emoji-id="5368324170671202286">🚨</tg-emoji>' + '\t\n<b>' + getInnerText(rows[i],ticketNumId) + '</b>\t\n\n'  
							+ columns[createdId] + '\t\n<b>' + getInnerText(rows[i],createdId) + ' (' + getInnerText(rows[i],ageId) + ')</b>\t\n\n' 
							+ columns[ticketTagId] + '\t\n<b>' + getInnerText(rows[i],ticketTagId) + '</b>\t\n\n'
							+ columns[titleId] + '\t\n<b>' + getInnerText(rows[i],titleId) + '</b>\t\n\n' 
							+ columns[customerNameId] + ' <tg-emoji emoji-id="5368324170671202286">😭</tg-emoji>' 
							+ '\t\n<b>' + getInnerText(rows[i],customerNameId) + '</b>\t\n\n'
							+ columns[stateId] + '\t\n<b>' + getInnerText(rows[i],stateId) + '</b>\t\n\n' 
							+ columns[ownerId] + '\t\n<b>' + getInnerText(rows[i],ownerId) + '</b>\t\n\n' 
							 
							
							);		

						*/							
/*							
						}
					}
					
					browser.storage.local.set({ 'tickets': tickets }).then(setItem, onError);
					
					if (hours >= 8 && hours < 21) {
						
						if (minute === 05) {
						
						//let ticketsCount = document.getElementById('Dashboard0130-TicketOpenAll').innerText.split('(')[1].split(')')[0]; 

						//sendMessage(
						//	'<tg-emoji emoji-id="5368324170671202286">📯</tg-emoji>' + ` Зараз є ${+ticketsCount} ${getKindTicket(ticketsCount)} `
						//	);
						sendMessage(getAnswerOnline());
						/* sendMessage(
							'<tg-emoji emoji-id="5368324170671202286">😎</tg-emoji>' + ' Просто нагадую, що я працюю'
							);
							*/
/*					}
					} 
					
					
							
				} else {
					if (hours >= 8 && hours < 21) {
						if (minute === 05) {
							sendMessage(
								'<tg-emoji emoji-id="5368324170671202286">😎</tg-emoji>' + ' На даний момент необроблених заявок немає'
								);
						}
					}
					
				} 
			}

		}, onError);
}

*/



//**************************************
async function checkNewTicket(columns) {
    const now = new Date();
    const minute = now.getMinutes();
    const hours = now.getHours();
	
	if (checkDialog()) {
		console.log('checkDialog');
		window.location.reload();
		return;
	}
	
	if (checkNetError()) {
		console.log('checkNetError');
		window.location.reload();
		return;
	}
	
	;
	
	

    if (checkLogin()) {
		
		try {
			const gettingItem = await browser.storage.local.get('username');
			user.username = gettingItem.username ? gettingItem.username : '';
		} catch (error) {
			console.error('Error getting username from storage:', error);
		}
		
		try {
			const gettingItem = await browser.storage.local.get('password');
			user.password = gettingItem.password ? gettingItem.password : '';
		} catch (error) {
			console.error('Error getting password from storage:', error);
		}
		
		//console.log('user', user.username);
		//console.log('password', user.password);
		
		const loginError = getLoginError();
		console.log('loginError', loginError);
		
		if (user.username != '' && user.password != '') {
			login();
		}
		
        if (hours >= 8 && hours < 21) {						
            if ([5, 20, 35, 50].includes(minute)) {
				if (loginError) {
					sendMessage('<blockquote>' + loginError + '</blockquote>\t\n' + getAnswer(answersLogin));
				} else {
					sendMessage(getAnswer(answersLogin));
				}				
                
            }
        }
        return;
    }
	
	
	if (window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?Action=AgentDashboard' &&
		window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?') {
		console.log('Not Dashboard', window.location.href);
		return;
	}

    const rows = document.getElementsByClassName("MasterAction");
	
	/*
	0: "Пріоритет"​
	1: "Нове повідомлення"​
	2: "TicketNumber"​
	3: "Створено"​
	4: "Відкрита"​
	5: "Заголовок"​
	6: "Стан"​
	7: "Власник"​
	8: "Ім'я клієнта"​
	9: "Тег заявки"​
	10: "Черга"
	*/

    const ticketNumId = columns.findIndex(el => el === 'TicketNumber');
    const createdId = columns.findIndex(el => el === 'Створено');
    const ageId = columns.findIndex(el => el === 'Відкрита');
    const titleId = columns.findIndex(el => el === 'Заголовок');
    const stateId = columns.findIndex(el => el === 'Стан');
    const ownerId = columns.findIndex(el => el === 'Власник');
    const customerNameId = columns.findIndex(el => el === "Ім'я клієнта");
    const ticketTagId = columns.findIndex(el => el === 'Тег заявки');
    const queueId = columns.findIndex(el => el === 'Черга');

    let tickets = [];

    try {
        const gettingItem = await browser.storage.local.get('tickets');
        tickets = gettingItem.tickets ? [...gettingItem.tickets] : [];
    } catch (error) {
        console.error('Error getting tickets from storage:', error);
    }

    if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
            const ticketNumber = getInnerText(rows[i], ticketNumId);
            const ticketState = getInnerText(rows[i], stateId);
            if (!tickets.includes(ticketNumber) && ticketState === 'Призначена') {
			//if (!tickets.includes(ticketNumber)) {
                tickets.push(ticketNumber);
                const ticketURL = getTicketURL(rows[i], ticketNumId);
                const ticketText = await getTicketText(ticketURL); // Асинхронний виклик

              /*  sendMessage(
                    `<tg-emoji emoji-id="5368324170671202286">🚨</tg-emoji>${columns[ticketNumId]}<tg-emoji emoji-id="5368324170671202286">🚨</tg-emoji>
                    \t\n<b>${getInnerText(rows[i], ticketNumId)}</b>\t\n\n${columns[createdId]}
                    \t\n<b>${getInnerText(rows[i], createdId)} (${getInnerText(rows[i], ageId)})</b>\t\n\n${columns[ticketTagId]}
                    \t\n<b>${getInnerText(rows[i], ticketTagId)}</b>\t\n\n${columns[titleId]}
                    \t\n<b>${getInnerText(rows[i], titleId)}</b>\t\n\n${columns[customerNameId]} <tg-emoji emoji-id="5368324170671202286">😭</tg-emoji>
                    \t\n<b>${getInnerText(rows[i], customerNameId)}</b>\t\n\n${columns[stateId]}
                    \t\n<b>${getInnerText(rows[i], stateId)}</b>\t\n\n${columns[ownerId]}
                    \t\n<b>${getInnerText(rows[i], ownerId)}</b>\t\n\n${ticketText}`
                );
				*/
				
				sendMessage(
							'🚨' +columns[ticketNumId] + '🚨' + '\t\n' 
							+ `<a href="${ticketURL}">`+ getInnerText(rows[i],ticketNumId) + '</a>\t\n\n'  
							+ columns[createdId] + '\t\n<b>' + getInnerText(rows[i],createdId) + ' (' + getInnerText(rows[i],ageId) + ')</b>\t\n\n' 
							+ columns[ticketTagId] + '\t\n<b>' + getInnerText(rows[i],ticketTagId) + '</b>\t\n\n'
							+ columns[titleId] + '\t\n<b>' + getInnerText(rows[i],titleId) + '</b>\t\n\n' 
							+ columns[customerNameId] + ' 😭' + '\t\n<b>' + getInnerText(rows[i],customerNameId) + '</b>\t\n\n'
							+ ticketText 
							//+ columns[stateId] + '\t\n<b>' + getInnerText(rows[i],stateId) + '</b>\t\n\n' 
							//+ columns[ownerId] + '\t\n<b>' + getInnerText(rows[i],ownerId) + '</b>\t\n\n' 
							 
							
							);
            }
        }

        try {
            await browser.storage.local.set({ 'tickets': tickets });
        } catch (error) {
            console.error('Error setting tickets to storage:', error);
        }

        if (hours >= 8 && hours < 21 && minute === 05) {
            sendMessage(getAnswer(answersOnline));
        }
    } else {
        if (hours >= 8 && hours < 21 && minute === 5) {
            sendMessage('<tg-emoji emoji-id="5368324170671202286">😎</tg-emoji> На даний момент необроблених заявок немає');
        }
    }
}

async function blockTicket(url) {
	try {
        const responseID = await fetch(url);
        if (!responseID.ok) {
            throw new Error('Network response was not ok for the first fetch');
			return false;
        }

        const textTicket = await responseID.text();		
		const blockURL = getBlockUrl(textTicket);


        if (!blockURL) {
            throw new Error('Block URL not found');
			return false;
        }

        /*const response2 = await fetch(blockURL);
        if (!response2.ok) {
            throw new Error('Network response was not ok for the second fetch');
        }*/
		
		console.log('block', blockURL);
	
        return true;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
		return false;
    }
}

function getBlockUrl(textTicket) {
	//const htmlTicket = stringToHTML(textTicket);
	
	const parser = new DOMParser();
    const htmlTicket = parser.parseFromString(textTicket, 'text/html');
		
	const loc = htmlTicket.getElementById('nav-Lock');	
	if (loc) {
		return loc.children[0].href;
	}
	
	return false;
}

async function updTiketBlock(row, bgColor, color, ticketsBlock){

	await setData('ticketsBlock', ticketsBlock);
	
	row.querySelectorAll('td').forEach(td => {
		td.style.backgroundColor = bgColor;
		td.style.color = color;
	});
}

async function getTicketText(url) {	
    try {
        const responseID = await fetch(url);
        if (!responseID.ok) {
            throw new Error('Network response was not ok for the first fetch');
        }

        const htmlID = await responseID.text();
        const article = getArticleID(htmlID);
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
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function getArticleID(text) {
    const html = stringToHTML(text);
    const content = html.getElementsByClassName('No');		
    if (content.length === 0) {
        console.error('Article ID not found in content');
        return null;
    }
	
	//console.log('no', content, content[content.length-1].children[1].value);
	const articleID = {id: content[content.length-1].children[1].value,
					  url: content[content.length-1].children[0].value}
    return articleID;
}

async function getArticleText(text, articleId) {
    const articleBodyHtml = stringToHTML(text);
    const articleBody = articleBodyHtml.getElementsByClassName('ArticleBody');
	const messageBrowser = articleBodyHtml.getElementsByClassName('MessageBrowser');
	
	//console.log('articleBody', articleBodyHtml);

    if (articleBody.length > 0) {
       // console.log('ArticleBody', articleBody);
		const textMessage = articleBody[0].innerText.split('********************************************************************************')[0]
							.split('***'); 
        const mess = textMessage[0].trim()
							+ '\n***\n' + textMessage[1].split('\n')[1].trim();
        //console.log('mess', mess);
        return mess;			
    } else if (messageBrowser.length > 0) {		
		const ifr = articleBodyHtml.getElementsByClassName('ArticleMailContentHTMLWrapper');
		
		if (ifr.length>0) {			
			const src = ifr[0].children[`Iframe${articleId}`].src;			

			try {
				const responseID = await fetch(src);
				if (!responseID.ok) {
					throw new Error('Network response was not ok for the first fetch');
				}

				const iframeText = await responseID.text();				
				const iframeHtml = stringToHTML(iframeText);
				const textMessage = iframeHtml.innerText.trim(); 
				//console.log('textMessage',textMessage);
				const mess =  textMessage;
				return mess;			
			} catch (error) {
				console.error('There has been a problem with your fetch operation:', error);
			}
			
		}
		       
        return 'Текст заявки: \t\n<b> Щоб побачити текст, відкрийте заявку</b> 😅';
    } else {
		console.error('ArticleBody not found');
		return 'Текст заявки: \t\n<b> Щоб побачити текст, відкрийте заявку</b> 😅';
	}
}

//**************************************

async function setData(key, value) {
	try {
            await browser.storage.local.set({ [key]: value });
        } catch (error) {
            console.error(`Error setting ${key} to storage:`, error);
        }
		
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
    //console.log('gettingItem', gettingItem[key]);
    return gettingItem[key];
}	


//*************Login***********************
function login() {
	
	const graf = document.getElementsByClassName('D3GraphCanvas');
	if (graf.length>0) {
		window.location.reload();
		return;
	}
	
	const userInput = document.getElementById('User'); 
	const passwordInput = document.getElementById('Password'); 

	if (userInput && passwordInput) {
		userInput.value = user.username; 
		passwordInput.value = user.password;
		document.login.submit();
	}
	
}

//*************End Login*******************

function stringToHTML (text) {
	let parser = new DOMParser();
	let doc = parser.parseFromString(text, 'text/html');
	return doc.body;
}

function checkDialog() {
	const dialog = document.getElementsByClassName('Dialog'); 
	return dialog.length>0;
}

function checkNetError() {
	const errButt = document.getElementById('netErrorButtonContainer');
	if (errButt) {
		 
		return true
	} else {
		return false;
	}
	/*
	if (errButt) {
		window.location.reload();
	}*/
}

function checkLogin() {
	const loginBox = document.getElementById('LoginBox');
	//console.log('loginBox',loginBox);
	//console.log(document.getElementsByClassName('Error'));
	if (loginBox) {	
		 
		return true
	} else {
		return false;
	} 
}

function getLoginError() {
	const err = document.getElementsByClassName('Error');
	
	if (err.length>0) {
		for (let i=0; i<err.length; i++) {
			if (err[0].innerText.trim() !== '') {
				return err[0].innerText.trim()
			}
		}		
	}	
	return '';
}

function getAnswer(answers) {	
	const id = Math.floor(Math.random() * ((answers.length - 1) - 0 + 1)) + 0;
	console.log('id',id);
	return answers[id];
}


function getKindTicket(count) {
	switch (count.substr(count.length - 1)) {
		case '1': return 'необроблена заявка';
			break;
		case '2': 
		case '3':
		case '4':	return 'необроблені заявки';
			break;
		default: return 'необроблених заявок'
	}
	
}

function getColumns() {
	if (!isDashboard()) {
		return [];
	}
	let columns = [];
	const headers = document.getElementsByClassName("DashboardHeader");

	for (let i=0; i<headers.length; i++) {
		columns.push(headers[i].children[0].title.split(',')[0]);	
	}
	
	setData('columns', columns);
	return columns;
}

function isDashboard() {
	if (window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?Action=AgentDashboard' &&
		window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?') {
		console.log('Not Dashboard', window.location.href);
		return false;
	}
	
	return true;
}

function getInnerText(row, id) {
	return row.children[id].innerText
}

function setTitleText(row, id, titleText) {
	if (row.children[id].children.length>0) {
		row.children[id].children[0].title = titleText;
	}
	
}

function getTicketURL(row, id) {
	return row.children[id].children[0].href
}

/*function setItem() {
  console.log("OK");
}*/

/*function onError(error) {
  console.log(error);
}*/

/*function onGot(item) {
	console.log('onGot', item);
}*/

function sendMessage(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const data = {
        chat_id: CHAT_ID,
        text: message,
		parse_mode: 'html'
    };

    fetch(url, {
        method: 'POST',
		headers: {
            'Content-Type': 'application/json'
        },
		mode: 'cors',        
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        //console.log('Message sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });
}

/*function oldSendMessage(message) {
	let url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
	
	const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: message
    });
	
	let formData = new FormData();

	formData.append("chat_id", CHAT_ID);
	formData.append("text", message);
	
	console.log('data',data);
    try {
		let oReq = new XMLHttpRequest();
		oReq.open("POST", url, true);
	
		oReq.setRequestHeader('Content-Type', 'application/json');
		oReq.setRequestHeader('Origin', 'http://ukrposhta.loc');
		
		oReq.send(formData);
		console.log('Message sent successfully', url);
	} catch (error) {
		console.error('Error sending message:', error);
	}
    
}*/










