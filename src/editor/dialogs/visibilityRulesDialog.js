/* globals svgEditor */
import visibilityRulesDialog from './visibilityRulesDialog.html'
const template = document.createElement('template')
template.innerHTML = visibilityRulesDialog
/**
 * @class SeVisibilityRulesDialog
 */
export class SeVisibilityRulesDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this.colorBlocks = ['#FFF', '#888', '#000', 'chessboard']
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dialog = this._shadowRoot.querySelector('#visibility_rule')
    this.$saveBtn = this._shadowRoot.querySelector('#tool_prefs_save')
    this.$cancelBtn = this._shadowRoot.querySelector('#tool_prefs_cancel')
    this.BASE_URL = this.getParameterByName('docroot')
	  this.URL_RULES_AUTOCOMPLETE = this.BASE_URL + "/api/rule/find"
    this.selElems = [];
	  this.elemRules = {}
	  this.elemRules1 = ""
	  this.ruleIdNameMap = {}
    this.inputElement = this._shadowRoot.querySelector('#rule_name')    
    this.autocomplete(this.inputElement);
  
    this.loadRules();
   
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('common-ok', i18next.t('common.ok'))
    this.setAttribute('common-cancel', i18next.t('common.cancel'))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    // eslint-disable-next-line max-len
    return ['dialog','common-ok', 'common-cancel']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return

    let node
    switch (name) {
      case 'dialog':
        if (newValue === 'open') {
         
          this.$dialog.open()
         
          var selectedElemID = this.getAttribute('selectedElemID');
          if(selectedElemID){
            var arr= [{'id':selectedElemID, 'tagName':this.getAttribute('selectedElemTagName'),}];           
            this.selectedChanged(arr)
          }
         
        } else {
          this.$dialog.close()
        }
        break
      case 'common-ok':
        break
      case 'common-cancel':
        this.$cancelBtn.textContent = newValue
        break

      default:
        // super.attributeChangedCallback(name, oldValue, newValue)
        break
    }
  }



  /**
   * @function get
   * @returns {any}
   */
  get dialog () {
    return this.getAttribute('dialog')
  }

  /**
   * @function set
   * @returns {void}
   */
  set dialog (value) {
    this.setAttribute('dialog', value)
  }


  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const onCancelHandler = () => {
      const closeEvent = new CustomEvent('change', {
        detail: {
          dialog: 'closed'
        }
      })
      this.dispatchEvent(closeEvent)
    }

    // Set up editor background functionality
    const currentObj = this


    // svgEditor.$click(this.$saveBtn, onSaveHandler)
    svgEditor.$click(this.$cancelBtn, onCancelHandler)
    this.$dialog.addEventListener('close', onCancelHandler)
  }

   getParameterByName (name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results == null) {
			return "";
		} else {
			return decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	}

    autocomplete(inp) {
    var that = this;
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists(this.parentNode);
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);

        async  function ruleApiCall(val) {
          try {        
          
          var header = localStorage["AlertApp-Authorization"];
          var requestBody = { "filterCriteria": [{ "fieldName": "intStatus", "operator": "in", "valueList": [0, 9] }, 
          { "fieldName": "type", "operator": "in", "valueList": ["Badge Designer Rule"] }, 
          { "fieldName": "text", "operator": ":", "value": val }], "page": 1, "start": 0, "size": 25, "sortByString": "[{\"property\":\"createdOn\",\"direction\":\"DESC\"}]" };
            // Define the fetch options
            const fetchOptions = {
              method: 'POST', // or 'GET', 'PUT', 'DELETE', etc.
              headers: {
                  'Content-Type': 'application/json', // Specify the content type of the request body
                  'Authorization': header, // Pass the authentication token in the 'Authorization' header
                  'securityCode': 'Foo',
                  'passkey': 'Bar'
              },
              body: JSON.stringify(requestBody) // Convert the request body to JSON format
            };
            var dynamicTextData = {};
            dynamicTextData =  await fetch(that.URL_RULES_AUTOCOMPLETE, fetchOptions);
            const responseData = await dynamicTextData.json();
            if(responseData && responseData.data) {
              //console.log(responseData);
              //return await responseData.data;
              for (i = 0; i < responseData.data.length; i++) {
                var arr = responseData.data[i];
                
               
                /*check if the item starts with the same letters as the text field value:*/
                if (arr.text.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                  /*create a DIV element for each matching element:*/
                  b = document.createElement("DIV");
                  /*make the matching letters bold:*/
                  b.innerHTML = "<strong>" + arr.text.substr(0, val.length) + "</strong>";
                  b.innerHTML += arr.text.substr(val.length);
                  /*insert a input field that will hold the current array item's value:*/
                  b.innerHTML += "<input type='hidden' id = '"  + arr.id + "' value='"  + arr.text + "'>";
                 
                  
                  /*execute a function when someone clicks on the item value (DIV element):*/
                  b.addEventListener("click", function(e) {
                      /*insert the value for the autocomplete text field:*/
                      //inp.value = this.getElementsByTagName("input")[0].value;
                      /*close the list of autocompleted values,
                      (or any other open lists of autocompleted values:*/
                      var val = this.getElementsByTagName("input")[0].value;
                      var ruleID = parseInt(this.getElementsByTagName("input")[0].id);
                      var object = {"label":val,"value" : ruleID,"ruleName":val}
                      that.addRule(object);
                       setTimeout(
                              function () {
                           that._shadowRoot.getElementById('rule_name').value = "";
                          }, 100
                      );                      
                     
                      closeAllLists(this.closest('label'));
                  });
                  a.appendChild(b);
                }
              }
            }
          } catch (error) {
            console.error(error)
          }
        }
       
        var ruleData = ruleApiCall(val);
    
        /*for each item in the array...*/
       
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(parentDiv,elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = parentDiv.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }

   
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(document,e.target);
    });
  }



   loadRules() {   
      var ruleString = localStorage.getItem('svgedit-visibilityRules');
      if(ruleString){
      this.elemRules1 = ruleString;
      if (ruleString) {
        var rules = JSON.parse(ruleString);
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i];
          if (this.elemRules[rule.elemId] == null) {
            this.elemRules[rule.elemId] = [];
          }
          this.elemRules[rule.elemId].push(parseInt(rule.ruleId));
          this.ruleIdNameMap[parseInt(rule.ruleId)] = rule.ruleName;
        }
      }
    }    
    }
  
     getElemRules() {
      return this.elemRules;
    }
  
    // showRulesPopup() {
    //   $('#svg_visibility_rules').show();
    //   $('#svg_visibility_rules .ui-autocomplete').css('top', ($('#rule_name').offset().top - $('#svg_visibility_rules_container').offset().top + $('#rule_name').height() + 5) + 'px');
    //   $('#svg_visibility_rules .ui-autocomplete').css('left', ($('#rule_name').offset().left - $('#svg_visibility_rules_container').offset().left) + 'px');
    // }
  
    //  showPanel(on) {
    //   $('#rule_panel').toggle(on);
    // }
  
     addRule(rule) {
      var elemId = this.selElems[0].id;
  
      if (this.elemRules1 == "") {
        this.elemRules1 = "[{\"elemId\":\"" + this.selElems[0].id + "\",\"ruleId\":\"" + rule.value + "\",\"ruleName\":\"" + rule.ruleName + "\"}";
      } else {
        if (this.elemRules1.charAt(this.elemRules1.length - 1) == "]") {
          this.elemRules1 = this.elemRules1.slice(0, -1);
        }
        this.elemRules1 = this.elemRules1 + "," + "{\"elemId\":\"" + this.selElems[0].id + "\",\"ruleId\":\"" + rule.value + "\",\"ruleName\":\"" + rule.ruleName + "\"}";
      }
      if (this.elemRules1 != "") {
        this.elemRules1 = this.elemRules1 + "]";
      }
      if (this.elemRules[elemId] == null) {
        this.elemRules[elemId] = [];
      }
      if (this.elemRules[elemId].indexOf(rule.value) < 0) {
        this.elemRules[elemId].push(rule.value);
        this.populateRule(rule);
      }
      this.ruleIdNameMap[rule.value] = rule.label;
      localStorage.setItem('svgedit-visibilityRules', this.elemRules1)
      //parent.getElementById(window.frameElement.id).contentDocument.getElementById("visibilityRuless").value = this.elemRules1;
    }
  
     populateRule(rule) {      
      var ruleHTML = '<span class="rule_name_label" data-id="' + rule.value + '" >' + rule.label + '<span id="' + rule.value + '" class="ruleDelete">x</span></span>';
      this._shadowRoot.getElementById('selected_rules').innerHTML += ruleHTML; 
      var removeElem = this._shadowRoot.querySelectorAll(".ruleDelete")
      removeElem.forEach(element => {
        element.addEventListener('click', this.removeRule.bind(this,element))                        
      });    
    }
  
    removeRule(element , event) {
      if(element && element.parentNode){
        element.parentNode.remove()
      }
      var ruleId = parseInt(element.id);
      var elemId = this.selElems[0].id;
      var index = this.elemRules[elemId].indexOf(ruleId);
      if (index > -1)
        this.elemRules[elemId].splice(index, 1);
      var finalRules = JSON.parse(this.elemRules1);
      for(var item in this.elemRules){
        if(this.elemRules[item].length == 0){
          finalRules = finalRules.filter(a => a.elemId!=item );
        }
      }
      if(finalRules.length > 0){
        this.elemRules1 = JSON.stringify(finalRules);
      }else{
        this.elemRules1 = "";
      }
      localStorage.setItem('svgedit-visibilityRules', this.elemRules1)
     // parent.document.getElementById(window.frameElement.id).contentDocument.getElementById("visibilityRuless").value = this.elemRules1;
    }
  
      showRules(elem) {
      var rules = this.elemRules[elem.id];
      this._shadowRoot.getElementById('rule_name').value = "";
      this._shadowRoot.getElementById('selected_rules').innerHTML = "";
      var rulesVal = [];

      if (rules != null && rules.length > 0) {
        for (var i = 0; i < rules.length; i++) {
        if(rulesVal.indexOf(rules[i]) == -1){
          rulesVal.push(rules[i])
        }
      }
      
        for (var i = 0; i < rulesVal.length; i++) {
          this.populateRule({
            value: rulesVal[i],
            label: this.ruleIdNameMap[rulesVal[i]]
          });
        }
      }
      this.elemRules[elem.id] = rulesVal;
    }
    selectedChanged(opts) {
			// Use this to update the current selected elements
			//console.log('selectChanged',opts);
			this.selElems = opts;
      
			var i = this.selElems.length;
			var rule_elems = ['a', 'circle', 'ellipse', 'foreignObject', 'g', 'image', 'line', 'path', 'polygon', 'polyline', 'rect', 'svg', 'text', 'tspan', 'use'];

			while (i--) {
				var elem = this.selElems[i];
				if (elem && rule_elems.indexOf(elem.tagName) !== -1) {
					if (!opts.multiselected) {
						//this.showPanel(true);
						this.showRules(elem);
					} else {
						//this.showPanel(false);
					}
				} else {
					//this.showPanel(false);
				}
			}
		}

		elementChanged(opts) {
			//console.log('elementChanged',opts);
			for (var i = 0; i < opts.elems.length; i++) {
				var elem = opts.elems[i];
				if (elem != null && svgCanvas.getElem(elem.id) == null) {
					this.elemRules[elem.id] = null;
				}
			}
		}
  
    //   buildButtonList() {
    //   var buttons = [];
  
    //   buttons.push({
    //     id: 'visibility_rules',
    //     icon: "images/icons/element-visibility.png",
    //     title: 'Add Visibility Rule',
    //     type: 'context',
    //     events: { 'click': this.showRulesPopup },
    //     panel: 'rule_panel'
    //   });
    //   return buttons;
    // }
  
	

	
	
}

// Register
customElements.define('se-visibility-rules-dialog', SeVisibilityRulesDialog)
