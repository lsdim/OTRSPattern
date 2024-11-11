
const waitingForm = document.getElementById('blockForm');

const ticketNum = document.getElementById("ticketNum");

let ticketNumsTable = document.getElementById("ticketsTable");

let ticketNums = [];

 getData('ticketsBlock').then(value => {
		ticketNums = value ? [...value] : [];
		
		ticketNums.forEach(ticketNum => addRow(ticketNum));
		
       //console.log('ticketNums', ticketNums);
 });


waitingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  

  if (ticketNum.value == "") {
    alert("Заповніть поле!");
  } else {
	  
	  //changeIcon();
	  ticketNums.push(ticketNum.value);
	  setData(ticketNums);
	  addRow(ticketNum.value);	 

	  waitingForm.reset();

  }
  
  console.log('submit');

  // handle submit
});




let buttons = document.querySelectorAll("table button");
		  ticketNumsTable.addEventListener('click', (e) => {
			if (e.target.nodeName === 'BUTTON' && e.target.name === 'remove') {
				//ticketNums = ticketNums.filter(el => el!==e.target.closest('tr').cells[0].innerHTML)
				ticketNums.splice(ticketNums.indexOf(e.target.closest('tr').cells[0].innerHTML),1);
				setData(ticketNums);
				console.log('ticketNums',ticketNums);
			  e.target.closest('tr').remove();
			}
		  });


		  
function addRow(ticketNum){
	
		const row = ticketNumsTable.insertRow(0);

		const cell1 = row.insertCell(0);
		const cell2 = row.insertCell(1);

		cell1.innerHTML = ticketNum;
		cell2.innerHTML = '<button type="button" name="remove">Видалити</button>'; 
	
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

async function setData(ticketNums) {
	try {
            await browser.storage.local.set({ 'ticketsBlock': ticketNums });
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