
console.log('start');

let user = {};

const dev_chat = '-4228417669';
const prod_chat = '-4267367123';

const BOT_TOKEN = '7255647619:AAH0dKnIaCsFRx7Dg2qyezOWuum4ItZBkec';
//const CHAT_ID = dev_chat;

let chatBot = {
	'isActive': false,
	'chatId': '-4228417669',
	'botId': '7255647619'
};


//document.body.style.border = "2px solid red";
let columns = getColumns();


//**********************************************************************************************
const intervalID = setInterval(modTicket, 10000, columns);
modTicket(columns);


if (isTicketZoom()) {
	const ticketClose = document.querySelector('#nav-Close a');
	if (ticketClose) {
		ticketClose.addEventListener("click", saveTicketText);
	}

	setIndexTitleOpenHours();
}

async function delay(time) {

	const tmp = document.getElementsByClassName('Loading');
	await new Promise(resolve => setTimeout(resolve, time));
	if (tmp.length > 0) {
		await delay(time);
	}

	return;
}


async function modTicket(columns) {

	await delay(200);

	//console.log('modTicket');

	const now = new Date();
	const minute = now.getMinutes();
	const hours = now.getHours();

	if (checkDialog()) {
		console.log('checkDialog');
		window.location.reload();
		return;
	}



	checkFAQ();
	InsertFull();
	showPatternHistory();



	/*	
		if (checkNetError()) {
			console.log('checkNetError');
			window.location.reload();
			return;
		}
		*/

	if (checkLogin()) {

		await getData('user').then(value => {
			user = value ? { ...value } : {};
		});


		if (user.isActive) {
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
	}

	if (isTicketZoom()) {
		console.log('isTicketZoom()', isTicketZoom());
		const row1 = document.getElementById('Row1');
		if (row1) {
			/*console.log('row1',row1);
			row1.addEventListener("click", function() {
				delay(1000);
				addTagToText();
				console.log('addClick row1');
			});*/
		}

		addTagToText();
		const ip = document.getElementById('ip');
		if (ip) {
			ip.addEventListener("click", function () {
				copySelection('ip');
			});
		}

	}

	if (!isDashboard()) {
		return;
	}

	const rows = document.getElementsByClassName("MasterAction");

	const idList = {};

	idList.ticketNumId = columns.findIndex(el => el === 'TicketNumber');
	idList.createdId = columns.findIndex(el => el === 'Створено');
	idList.ageId = columns.findIndex(el => el === 'Відкрита');
	idList.titleId = columns.findIndex(el => el === 'Заголовок');
	idList.stateId = columns.findIndex(el => el === 'Стан');
	idList.ownerId = columns.findIndex(el => el === 'Власник');
	idList.customerNameId = columns.findIndex(el => el === "Ім'я клієнта");
	idList.ticketTagId = columns.findIndex(el => el === 'Тег заявки');
	idList.queueId = columns.findIndex(el => el === 'Черга');

	document.querySelectorAll('.Pagination a').forEach(link => {
		//console.log('link',link);
		link.addEventListener('click', function () {
			modTicket(columns);
		});
	});

	getChatBot();

	if (rows.length > 0) {
		checkWaitingList(rows, idList);
		checkBlockList(rows, idList);
		addWorkTime(rows, idList.customerNameId);
		addTitle(rows, idList);
	}

}

async function InsertFull() {
	if (!isTicketZoom() && !isDashboard()) {
		if (document.getElementsByClassName('FAQ').length > 0) {
			if (document.getElementsByClassName('FAQ')[0].contentWindow.document.getElementById('InsertFull')) {
				if (document.getElementsByClassName('FAQ')[0].contentWindow.document.getElementById('SavePatternsHistory')) {
					return;
				}

				const loadButton = document.getElementsByClassName('FAQ')[0].contentWindow.document.getElementById('InsertFull');
				let i = document.createElement('i');
				i.id = 'SavePatternsHistory';
				i.className = 'fa fa-list';
				// i.style = "display:none;";
				loadButton.appendChild(i);

				loadButton.addEventListener("click", getPatternsHistoryList);

				// console.log('InsertFull1111');
			}

		}
	}
}

async function getPatternsHistoryList() {
	let patternsHistoryList = [];
	await getData('patternsHistoryList').then(value => {
		patternsHistoryList = value ? [...value] : [];
	});

	let pattern = {};


	let pTitle = document.getElementsByClassName('Headline');
	if (pTitle.length > 0) {
		let title = pTitle[0].innerText.split(' - ');
		pattern.title = title[1].trim();
		pattern.id = title[0].split(' ')[1].trim();
	}

	let pUrl = document.getElementsByTagName('iframe');
	if (pUrl.length > 0) {
		let url = pUrl[0].src.split(';');
		pattern.url = url[0] + ';' + url[2] + ';Nav=None';
	}

	pattern.date = new Date();

	patternsHistoryList.push(pattern);
	if (patternsHistoryList.length > 10) {
		patternsHistoryList.pop();
	}
	console.log('patternsHistoryList', patternsHistoryList);
	await setData('patternsHistoryList', patternsHistoryList);

}

async function showPatternHistory() {

	if (document.getElementsByClassName('FAQ').length > 0) {
		const overviewBody = document.getElementsByClassName('FAQ')[0].contentWindow.document.getElementById('OverviewBody');
		if (overviewBody) {
			if (document.getElementsByClassName('FAQ')[0].contentWindow.document.getElementById('patternsHistoryList')) {
				return;
			}

			let patternsHistoryList = [];
			await getData('patternsHistoryList').then(value => {
				patternsHistoryList = value ? [...value] : [];
			});

			if (patternsHistoryList.length > 0) {
				let table = document.createElement('table');
				table.id = 'patternsHistoryList';
				table.className = 'DataTable';
				let thead = document.createElement('thead');
				let tr = document.createElement('tr');
				let th = document.createElement('th');
				th.innerText = 'FAQ#';
				tr.appendChild(th);
				th = document.createElement('th');
				th.innerText = 'Назва';
				tr.appendChild(th);
				th = document.createElement('th');
				th.innerText = 'Дата використання';
				tr.appendChild(th);
				thead.appendChild(tr);
				table.appendChild(thead);
				let tbody = document.createElement('tbody');
				patternsHistoryList.forEach(pattern => {
					let tr = document.createElement('tr');
					tr.className = 'MasterAction';
					let td = document.createElement('td');
					let a = document.createElement('a');
					a.href = pattern.url;
					a.className = 'AsBlock MasterActionLink';
					a.innerText = pattern.id;
					td.appendChild(a);
					tr.appendChild(td);
					td = document.createElement('td');
					td.innerText = pattern.title;
					tr.appendChild(td);
					td = document.createElement('td');
					td.innerText = pattern.date.toLocaleString();
					tr.appendChild(td);

					tr.addEventListener("click", function () {
						window.location.href = pattern.url;
					});

					tbody.appendChild(tr);
				});


				if (overviewBody) {
					overviewBody.appendChild(table);
					table.appendChild(tbody);
				}


			}
		} else {
			console.log('No OverviewBody');
		}
	}

}



async function checkFAQ() {
	if (!isTicketZoom() && !isDashboard()) {
		if (document.getElementsByClassName('FAQ').length > 0) {
			if (document.getElementsByTagName('iframe').length > 1) {
				if (document.getElementsByTagName('iframe')[1].contentWindow.document.getElementsByClassName('TableSmall').length > 0) {

					if (!document.getElementsByTagName('iframe')[1].contentWindow.document.getElementById('showDetails')) {

						console.log('add showDetails');

						let a = document.createElement('a');
						a.href = '#';
						a.id = 'showDetails';
						a.title = 'Показати деталі';
						let i = document.createElement('i');
						i.className = 'fa fa-eye';
						a.appendChild(i);

						let li = document.createElement('li');
						li.appendChild(a);
						const ul = document.getElementsByTagName('iframe')[1].contentWindow.document.getElementsByClassName('ContextFunctions')[0]
						ul.appendChild(li);

						a.addEventListener("click", showDetails);
					}


				}
				// console.log('FAQ');
			} else {
				console.log('Sorry? Not FAQ');
			}

		} else {
			console.log('Not FAQ');
		}
	}
}

async function showDetails() {
	const tab = document.getElementsByTagName('iframe')[1].contentWindow.document.getElementsByClassName('TableSmall')[0];

	if (tab.rows.length > 1) {
		for (let i = 1; i < tab.rows.length; i++) {

			const href = tab.rows[i].cells[getCellId('FAQ#')].children[0].href;
			const h = href.split(';');

			for (let j = 1; j < 4; j++) {
				const link = h[0] + ';Subaction=HTMLView;' + h[1] + ';Field=Field' + j;
				const text = await getFAQText(link);
				tab.rows[i].cells[getCellId('ЗАГОЛОВОК') + j].innerHTML = text;
			}

			tab.rows[i].cells[getCellId('ДІЙСНІСТЬ')].remove();
		}

		tab.rows[0].cells[getCellId('ДІЙСНІСТЬ')].remove();
		tab.rows[0].cells[getCellId('КАТЕГОРІЯ')].innerText = 'СИМПТОМИ';
		tab.rows[0].cells[getCellId('МОВА')].innerText = 'ПРОБЛЕМА';
		tab.rows[0].cells[getCellId('СТАН')].innerText = 'РІШЕННЯ';
	}
}


function getCellId(cellName) {
	const cellId = ['FAQ#', 'ЗАГОЛОВОК', 'КАТЕГОРІЯ', 'МОВА', 'СТАН', 'ДІЙСНІСТЬ', 'ЗМІНЕНО'];
	return cellId.findIndex(el => el === cellName);
}

async function getFAQText(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok for the getFAQText fetch');
		}

		const text = await response.text();
		const html = stringToHTML(text);

		// const content = html.getElementsByTagName('body');
		// console.log('html', html.innerHTML, content);
		if (!html) {
			console.error('FAQ not found in content');
			return null;
		} else {
			return html.innerHTML;
		}

	} catch (error) {
		console.error('There has been a problem with your fetch operation:', error);
	}
}

async function setIndexTitleOpenHours() {

	const indexElement = document.querySelectorAll('p.FixedValueSmall')[1];
	const customerIndex = indexElement.innerText;
	if (customerIndex.length == 5 && !isNaN(customerIndex)) {
		const openHours = await getOpenHours(customerIndex);

		if (openHours) {

			const state = getOpenStatusNow(openHours);
			const scheduleWork = getScheduleWork(openHours);

			const url = `http://help.ukrposhta.loc/otrs/index.pl?`
				+ `Action=AgentTicketSearch&Subaction=Search&EmptySearch=1&ShownAttributes=LabelTicketNumber%3BLabelFrom&`
				+ `Profile=&Name=&TicketNumber=&From=${customerIndex}&Attribute=Fulltext&ResultForm=Normal`;

			indexElement.innerHTML = `<a href="${url}">` + state.icon + indexElement.innerHTML + '</a>';
			indexElement.title = scheduleWork
			indexElement.style.color = state.color;

		}
	}
}

async function saveTicketText() {
	const ticketURL = window.location.href;
	const ticketText = await getTicketText(ticketURL); // Асинхронний виклик

	// console.log('ticketTextClose', ticketText.split('***')[0]);
	const ticketTextClear = ticketText.split('***')[0];
	await setData('ticketTextClose', ticketTextClear);

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
					'🚨' + columns[ticketNumId] + '🚨' + '\t\n'
					+ `<a href="${ticketURL}">` + getInnerText(rows[i], ticketNumId) + '</a>\t\n\n'
					+ columns[createdId] + '\t\n<b>' + getInnerText(rows[i], createdId) + ' (' + getInnerText(rows[i], ageId) + ')</b>\t\n\n'
					+ columns[ticketTagId] + '\t\n<b>' + getInnerText(rows[i], ticketTagId) + '</b>\t\n\n'
					+ columns[titleId] + '\t\n<b>' + getInnerText(rows[i], titleId) + '</b>\t\n\n'
					+ columns[customerNameId] + ' 😭' + '\t\n<b>' + getInnerText(rows[i], customerNameId) + '</b>\t\n\n'
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

		if (hours >= 8 && hours < 21 && minute === 5) {
			sendMessage(getAnswer(answersOnline));
		}
	} else {
		if (hours >= 8 && hours < 21 && minute === 5) {
			sendMessage('<tg-emoji emoji-id="5368324170671202286">😎</tg-emoji> На даний момент необроблених заявок немає');
		}
	}
}


//************************************************************************************




async function getChatBot() {

	await getData('chatBot').then(value => {
		chatBot = value ? { ...value } : { 'isActive': false, 'chatId': '-4228417669', 'botId': '7255647619' };
	});
}


async function addTitle(rows, idList) {
	for (let i = 0; i < rows.length; i++) {
		let ticketTitle = getInnerText(rows[i], idList.titleId);
		const ticketNum = getTitleText(rows[i], idList.ticketNumId);

		if (isTicketLocked()) {
			ticketTitle = ticketTitle.split('\n')[1];
		}

		if (ticketTitle !== ticketNum) {
			return;
		}

		const ticketURL = getTicketURL(rows[i], idList.ticketNumId);
		const ticketText = await getTicketText(ticketURL); // Асинхронний виклик

		setTitleText(rows[i], idList.ticketNumId, ticketText);
	}
}

async function addWorkTime(rows, customerId) {
	for (let i = 0; i < rows.length; i++) {
		const customerName = getInnerText(rows[i], customerId);
		const customerTitle = getTitleText(rows[i], customerId);

		if (customerName !== customerTitle) {
			// console.log('return');
			return;
		}
		// console.log(customerName + ' = ' + customerTitle);


		const customerIndex = customerName.split(' ')[0].trim();
		if (customerIndex.length == 5 && !isNaN(customerIndex)) {

			const openHours = await getOpenHours(customerIndex);

			if (openHours) {
				setTitleByWorkTime(rows[i], customerId, openHours);
			}

		}

	}
}

async function getOpenHours(customerIndex) {

	const url = `https://index.ukrposhta.ua/endpoints-for-apps/index.php?method=get_postoffices_openhours_by_postindex&pc=${customerIndex}`;

	try {
		const workTime = await fetch(url);
		if (!workTime.ok) {
			throw new Error('Network response workTime was not ok');
		}

		const jsonRez = await workTime.json();

		if (jsonRez.Entry) {
			const openHours = jsonRez.Entry;
			return openHours;
		}

	} catch (error) {
		console.error('Problem:', error);
	}
}

function setTitleByWorkTime(row, id, openHours) {

	const state = getOpenStatusNow(openHours);
	const innerHTML = getInnerHTML(row, id);
	setInnerHTML(row, id, state.icon + innerHTML);
	setTitleText(row, id, getScheduleWork(openHours));
	setColorByWorkTime(row, id, state.color);

}

function getScheduleWork(openHours) {
	const schedule = {};

	openHours.forEach(open => {
		schedule[open.DAYOFWEEK_NUM] = {}
	});

	openHours.forEach(open => {

		if (open.INTERVALTYPE === 'W') {
			schedule[open.DAYOFWEEK_NUM].day = open.DAYOFWEEK_UA;
			schedule[open.DAYOFWEEK_NUM].tFrom = open.TFROM;
			schedule[open.DAYOFWEEK_NUM].tTo = open.TTO;
		}

		if (open.INTERVALTYPE === 'D') {
			schedule[open.DAYOFWEEK_NUM].pause = true;
			schedule[open.DAYOFWEEK_NUM].pauseFrom = open.TFROM;
			schedule[open.DAYOFWEEK_NUM].pauseTo = open.TTO;
		}

	});

	const state = getOpenStatusNow(openHours)

	let scheduleWork = `Зараз - ${state.text} \n`;
	for (let i = 1; i < 8; i++) {
		if (schedule[i.toString()]) {
			let openTime = '';
			let pauseTime = '';
			if (schedule[i.toString()].pause) {
				pauseTime = ` перерва з ${schedule[i.toString()].pauseFrom} по ${schedule[i.toString()].pauseTo}`
			}
			openTime = `(з ${schedule[i.toString()].tFrom} по ${schedule[i.toString()].tTo}${pauseTime})`;

			scheduleWork = scheduleWork + `${schedule[i.toString()].day} ${openTime} \n`;
		}
	}

	return scheduleWork;
}

function getOpenStatusNow(openHours) {
	const state = isOpen(openHours);
	let status = {};

	switch (state) {
		case 'open': status.text = 'Відчинено';
			status.icon = '<i class="fa fa-check"></i>';
			status.color = 'green';
			break;
		case 'pause': status.text = 'Обідня перерва';
			status.icon = '<i class="fa fa-pause"></i>';
			status.color = '#ffc107';
			break;
		case 'close': status.text = 'Зачинено';
			status.icon = '<i class="fa fa-close"></i>';
			status.color = 'red';
			break;
	};

	return status;
}

function setColorByWorkTime(row, id, color) {
	row.children[id].style.color = color;
}

function isOpen(openHours) {
	const now = new Date();
	const today = now.getDay();
	const minute = now.getMinutes();
	const hours = now.getHours();

	let state = 'close';

	openHours.forEach(open => {
		if (+open.DAYOFWEEK_NUM === today && open.INTERVALTYPE === 'D') {
			const tFrom = open.TFROM.split(':');
			const tTo = open.TTO.split(':');
			if ((hours > +tFrom[0] || (hours === +tFrom[0] && minute >= +tFrom[1])) &&
				(hours < +tTo[0] || (hours === +tTo[0] && minute < +tTo[1]))) {
				// console.log('pause', open);
				state = 'pause';
			}
		}
		if (+open.DAYOFWEEK_NUM === today && open.INTERVALTYPE === 'W') {
			const tFrom = open.TFROM.split(':');
			const tTo = open.TTO.split(':');
			if ((hours > +tFrom[0] || (hours === +tFrom[0] && minute >= +tFrom[1])) &&
				(hours < +tTo[0] || (hours === +tTo[0] && minute < +tTo[1]))) {
				// console.log('open', open);
				state = state !== 'pause' ? 'open' : 'pause';
			}
		}
	});

	return state;
}


async function checkWaitingList(rows, idList) {

	let waitingList = [];

	await getData('waitingList').then(value => {
		waitingList = value ? [...value] : [];
	});
	if (waitingList.length > 0) {
		for (let i = 0; i < rows.length; i++) {

			waitingList.forEach(wait => {

				const colId = columns.findIndex(el => el === wait.col);
				const valueText = getInnerText(rows[i], colId);
				if (valueText.toUpperCase().indexOf(wait.data.toUpperCase()) >= 0) {

					rows[i].querySelectorAll('td').forEach(td => {
						td.style.backgroundColor = '#28a745';
						td.style.color = 'white';
					});

					const ticketNum = getInnerText(rows[i], idList.ticketNumId);

					if (!wait[ticketNum]) {
						sendWaitingMessage(`${wait.col} - ${wait.data}`, rows[i], idList);
						wait[ticketNum] = true;
					}
				}
			})
		}
		await setData('waitingList', waitingList);
	}
}

function sendWaitingMessage(text, row, idList) {
	if (chatBot.isActive) {
		const messageText = `Є заявка, яка відповідає умові очікуванні: \t\n`
			+ `🚨${text}🚨 \n\n`
			+ `<b>${getInnerText(row, idList.ticketNumId)}</b>\n\n`
			+ `${columns[idList.customerNameId]} \n<b> ${getInnerText(row, idList.customerNameId)} </b>\n\n`
			+ `${columns[idList.titleId]} \n<b> ${getInnerText(row, idList.titleId)} </b>\n\n`
			+ `${columns[idList.createdId]} \n<b> ${getInnerText(row, idList.createdId)}  (${getInnerText(row, idList.ageId)}) </b>`

		sendMessage(BOT_TOKEN, chatBot.chatId, messageText);
	}
}

async function checkBlockList(rows, idList) {

	let ticketsBlock = [];

	await getData('ticketsBlock').then(value => {
		ticketsBlock = value ? [...value] : [];
	});

	if (ticketsBlock.length > 0) {
		for (let i = 0; i < rows.length; i++) {

			const ticketNum = getInnerText(rows[i], idList.ticketNumId);
			const ticketState = getInnerText(rows[i], idList.stateId);

			if (ticketsBlock.includes(ticketNum)) {

				if (ticketState === 'Призначена') {
					const ticketURL = getTicketURL(rows[i], idList.ticketNumId);;
					const block = await blockTicket(ticketURL);
					if (block) {
						ticketsBlock.splice(ticketsBlock.indexOf(ticketNum), 1);
						await updTiketBlock(rows[i], '#fec33e', 'white', ticketsBlock);
						sendBlockMessage('Заблоковано заявку', rows[i], idList);

					} else {
						ticketsBlock.splice(ticketsBlock.indexOf(ticketNum), 1);
						await updTiketBlock(rows[i], 'rgb(236, 144, 115)', 'white', ticketsBlock);
						sendBlockMessage('Не вдалось заблокувати заявку', rows[i], idList);
					}
				} else {
					ticketsBlock.splice(ticketsBlock.indexOf(ticketNum), 1);
					await updTiketBlock(rows[i], 'rgb(236, 144, 115)', 'white', ticketsBlock);
					sendBlockMessage(`Не заблоковано \n Заявка не в статусі 'Призначена'`, rows[i], idList);
				}
			}

		}
	}
}

function sendBlockMessage(text, row, idList) {
	if (chatBot.isActive) {
		const messageText = `🚨${text} <b>${getInnerText(row, idList.ticketNumId)}</b>🚨\n\n`
			+ `${columns[idList.customerNameId]} \n<b> ${getInnerText(row, idList.customerNameId)} </b>\n\n`
			+ `${columns[idList.titleId]} \n<b> ${getInnerText(row, idList.titleId)} </b>\n\n`
			+ `${columns[idList.createdId]} \n<b> ${getInnerText(row, idList.createdId)}  (${getInnerText(row, idList.ageId)}) </b>`

		sendMessage(BOT_TOKEN, chatBot.chatId, messageText);
	}
}

async function blockTicket(url) {
	try {
		const responseID = await fetch(url);
		if (!responseID.ok) {
			throw new Error(`Error fetch: ${url}`);
			return false;
		}

		const textTicket = await responseID.text();
		const blockURL = getBlockUrl(textTicket);


		if (!blockURL) {
			throw new Error('Block URL not found');
			return false;
		}
		//*********************Comment if TEST */
		const response2 = await fetch(blockURL);
		if (!response2.ok) {
			if (chatBot.isActive) {
				sendMessage(BOT_TOKEN, chatBot.chatId, 'Я, чесно, намагався заблокувати заявку, але... ');
			}
			throw new Error('Network response was not ok for the second fetch');

		}

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

async function updTiketBlock(row, bgColor, color, ticketsBlock) {

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
	const articleID = {
		id: content[content.length - 1].children[1].value,
		url: content[content.length - 1].children[0].value
	}
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

		if (ifr.length > 0) {
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
				const mess = textMessage;
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

function addTagToText() {

	const ip = document.getElementById('ip');
	if (ip) {
		return;
	}

	const article = document.getElementsByClassName('ArticleBody');

	if (article.length > 0) {
		const articleText = article[0].innerHTML;
		//console.log('articleText',articleText);
		const tmp1 = articleText.substring(0, articleText.indexOf('IP адреса'));
		let tmp2 = articleText.substring(articleText.indexOf('IP адреса'), articleText.indexOf('Робоча група:'));
		const tmp3 = articleText.substring(articleText.indexOf('Робоча група:'));

		const tmp4Arr = tmp2.split(':');


		tmp4Arr[1] = '<span style="cursor:pointer; background:#ffc107" id="ip">' + tmp4Arr[1].trim() + '</span>';
		tmp2 = tmp4Arr.join(': ');

		console.log('tmp2', tmp2);

		article[0].innerHTML = tmp1 + tmp2 + tmp3;

	}

}


function selectText(elementId) {

	const element = document.getElementById(elementId);

	if (element) {
		const selection = window.getSelection();
		const range = document.createRange();
		selection.removeAllRanges();

		range.selectNodeContents(element);

		selection.addRange(range);
	}
}

function copySelection(elementId) {

	selectText(elementId);
	let selectedText = window.getSelection().toString().trim();

	if (selectedText) {
		document.execCommand("Copy");
		window.getSelection().removeAllRanges();
		const element = document.getElementById(elementId);
		element.style.background = '#28a745';
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
	if (graf.length > 0) {
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

function stringToHTML(text) {
	let parser = new DOMParser();
	let doc = parser.parseFromString(text, 'text/html');
	return doc.body;
}

function checkDialog() {
	//const dialog = document.getElementsByClassName('Dialog'); 
	const dialog = document.getElementById('DialogButton1');
	if (dialog) {
		return dialog.textContent === "Reload page";
	}
	return false;
}

function checkNetError() {
	const errButt = document.getElementById('netErrorButtonContainer');
	const errOTRS = document.getElementsByClassName('ErrorMessage');
	//const errAjax = document.getElementById('AjaxErrorDialog');

	if (errButt || errOTRS.length > 0) {
		//console.log(errButt, errOTRS.length);
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

	if (err.length > 0) {
		for (let i = 0; i < err.length; i++) {
			if (err[0].innerText.trim() !== '') {
				return err[0].innerText.trim()
			}
		}
	}
	return '';
}

function getAnswer(answers) {
	const id = Math.floor(Math.random() * ((answers.length - 1) - 0 + 1)) + 0;
	console.log('id', id);
	return answers[id];
}


function getKindTicket(count) {
	switch (count.substr(count.length - 1)) {
		case '1': return 'необроблена заявка';
			break;
		case '2':
		case '3':
		case '4': return 'необроблені заявки';
			break;
		default: return 'необроблених заявок'
	}

}

function getColumns() {
	if (!isDashboard()) {
		return [];
	}
	let columns = [];
	const className = isTicketLocked() ? 'OverviewHeader' : 'DashboardHeader';
	if (isTicketLocked()) {
		columns.push('rezerv');
	}

	const headers = document.getElementsByClassName(className);

	for (let i = 0; i < headers.length; i++) {
		columns.push(headers[i].children[0].title.split(',')[0]);
	}

	setData('columns', columns);
	return columns;
}

function isDashboard() {
	if (window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?Action=AgentDashboard' &&
		window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?' &&
		window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?Action=AgentTicketLockedView') {
		console.log('Not Dashboard', window.location.href);
		return false;
	}

	return true;
}

function isTicketLocked() {
	if (window.location.href != 'http://help.ukrposhta.loc/otrs/index.pl?Action=AgentTicketLockedView') {
		return false;
	}
	return true;
}

function isTicketZoom() {
	const index = window.location.href.indexOf('http://help.ukrposhta.loc/otrs/index.pl?Action=AgentTicketZoom;');
	if (index < 0) {
		//console.log('isTicketZoom', window.location.href, index);
		return false;
	}

	return true;
}

function getInnerText(row, id) {
	return row.children[id].innerText
}

function getTitleText(row, id) {
	return row.children[id].children[0].title;
}

function setTitleText(row, id, titleText) {
	if (row.children[id].children.length > 0) {
		row.children[id].children[0].title = titleText;
	}
}

function getInnerHTML(row, id) {
	return row.children[id].children[0].innerHTML;
}

function setInnerHTML(row, id, innerHTML) {
	if (row.children[id].children.length > 0) {
		row.children[id].children[0].innerHTML = innerHTML;
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

function sendMessage(BOT_TOKEN, CHAT_ID, message) {
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










