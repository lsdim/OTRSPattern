(() => {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function putTextInElement(text) {
	  const responseField = document.getElementsByClassName('cke_wysiwyg_frame'); //('cke_editable'); 
	  //const responseField  = document.getElementById('RichText');
  
	  //console.log('responseField', tmp);
	  
	  if (responseField.length=0) {
		  return;
	  }
	  
	  
	  const textField = responseField[0].contentDocument.children[0].innerHTML;
	  
	  
	  
	  const textArr = textField.split('-------------------------------------------');
	  textArr[0] = textArr[0] + text + '<br /><br />';
	  responseField[0].contentDocument.children[0].innerHTML = textArr.join('-------------------------------------------');
	  
	  /*
	  const textField = responseField.innerHTML;
	  
	  
	  
	  const textArr = textField.split('-------------------------------------------');
	  textArr[0] = textArr[0] + text + '<br /><br />';
	  responseField.innerHTML = textArr.join('-------------------------------------------');
	  
	  console.log('responseField2', responseField);
	  console.log('textField', responseField.innerHTML);
	  
	  */

  }  
	  
	  
  /**
   * Listen for messages from the background script.
   * Call "insertBeast()" or "removeExistingBeasts()".
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "putText") {
      putTextInElement(message.textMessage);
    };
  });
})();
