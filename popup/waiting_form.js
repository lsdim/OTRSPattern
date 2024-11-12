﻿
const waitingForm = document.getElementById('waitingForm');

const customer = document.getElementById("customer");

let customersTable = document.getElementById("customersTable");

const columnName = document.getElementById("columnName");

let customers = [];

let columns = [];

 getData('customers').then(value => {
		customers = value ? [...value] : [];
		
		customers.forEach(customer => addRow(customer));
		
       //console.log('customers', customers);
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
	 const customerNameId = columns.findIndex(el => el === colName);
		if (customerNameId>=0) {
			columnName.value = customerNameId;
		}
 }


waitingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  

  if (customer.value == "") {
    alert("Заповніть поле!");
  } else {
	  
	  //changeIcon();
	  customers.push(customer.value);
	  setData(customers);
	  addRow(customer.value);
	  const col = columnName.value;	

	  waitingForm.reset();
	  columnName.value = col;

  }
  
  console.log('submit');

  // handle submit
});




let buttons = document.querySelectorAll("table button");
		  customersTable.addEventListener('click', (e) => {
			if (e.target.nodeName === 'BUTTON' && e.target.name === 'remove') {
				//customers = customers.filter(el => el!==e.target.closest('tr').cells[0].innerHTML)
				customers.splice(customers.indexOf(e.target.closest('tr').cells[0].innerHTML),1);
				setData(customers);
				console.log('customers',customers);
			  e.target.closest('tr').remove();
			}
		  });


		  
function addRow(customer){
	
		const row = customersTable.insertRow(0);

		const cell1 = row.insertCell(0);
		const cell2 = row.insertCell(1);

		cell1.innerHTML = customer;
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

async function setData(customers) {
	try {
            await browser.storage.local.set({ 'customers': customers });
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