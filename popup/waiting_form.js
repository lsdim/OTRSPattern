
const waitingForm = document.getElementById('waitingForm');

const waiting = document.getElementById("waiting");

let waitingListTable = document.getElementById("waitingListTable");

const columnName = document.getElementById("columnName");

let waitingList = [];

let columns = [];

 getData('waitingList').then(value => {
		waitingList = value ? [...value] : [];
		
		waitingList.forEach(value => addRow(value.data, value.col));
		
       //console.log('waitingList', waitingList);
 });
 
  getData('columns').then(value => {
		columns = value ? [...value] : [];
		
		columnName.innerHTML = null;
		
		
		
		columns.forEach((column, index) => {
			let opt = document.createElement('option');
			opt.value = index;
			opt.innerHTML = column;
			columnName.appendChild(opt);
		});
		
		setDefaultSelect("Ім'я клієнта");
		
 });
 
 function setDefaultSelect(colName) {
	 const colNameId = columns.findIndex(el => el === colName);
		if (colNameId>=0) {
			columnName.value = colNameId;
		}
 }


waitingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  

  if (waiting.value == "") {
    alert("Заповніть поле!");
  } else {
	  
	  //changeIcon();
	  const col = columnName.value;
	  const optionText = columnName.querySelector(`option[value="${col}"]`).textContent;
	  console.log('submit', optionText);
	  waitingList.push({'data': waiting.value, 'col': optionText});
	  setData(waitingList);
	  addRow(waiting.value, optionText);
	  	

	  waitingForm.reset();
	  columnName.value = col;

  }
  
  console.log('submit');

  // handle submit
});




let buttons = document.querySelectorAll("table button");
		  waitingListTable.addEventListener('click', (e) => {
			if (e.target.nodeName === 'BUTTON' && e.target.name === 'remove') {
				//waitingList = waitingList.filter(el => el!==e.target.closest('tr').cells[0].innerHTML)
				waitingList.splice(waitingList.findIndex(element => element.data === e.target.closest('tr').cells[1].innerHTML &&
				element.col === e.target.closest('tr').cells[0].innerHTML),1);
				setData(waitingList);
				console.log('waitingList',waitingList);
			  e.target.closest('tr').remove();
			}
		  });


		  
function addRow(data, column){
	
		const row = waitingListTable.insertRow(0);

		const cell1 = row.insertCell(0);
		const cell2 = row.insertCell(1);
		const cell3 = row.insertCell(2);

		cell1.innerHTML = column;
		cell2.innerHTML = data;
		cell3.innerHTML = '<button type="button" name="remove">Видалити</button>'; 
		
		cell1.style.width = "40%";
		cell2.style.width = "40%";
		cell3.style.width = "20%";
	
}

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

async function setData(waitingList) {
	try {
            await browser.storage.local.set({ 'waitingList': waitingList });
        } catch (error) {
            console.error('Error setting tickets to storage:', error);
        }
		//console.log('set');
}

async function getData(key) {
	const gettingItem = await browser.storage.local.get(key);
    //console.log('gettingItem', gettingItem[key]);
    return gettingItem[key];

}

function setItem() {
  console.log("OK");
}

function onError(error) {
  console.log(error);
}