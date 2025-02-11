/* globals svgEditor */

/**
 * @class IdentityAssetText
 */
export class IdentityAssetText extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    // create the shadowDom and insert the template
    this.imgPath = svgEditor.configObj.curConfig.imgPath
    this.template = this.createTemplate(this.imgPath)
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(this.template.content.cloneNode(true))
    // locate the component
    this.$button = this._shadowRoot.querySelector('.menu-button')
    this.$overall = this._shadowRoot.querySelector('.overall')
    this.$img = this._shadowRoot.querySelector('.menu-button img')
    this.$menu = this._shadowRoot.querySelector('.menu')
    this.$handle = this._shadowRoot.querySelector('.handle')
    this.files = []
    this.request = new XMLHttpRequest()
    this.imgPath = svgEditor.configObj.curConfig.imgPath

    // Closes opened (pressed) lib menu on click on the canvas
    const workarea = document.getElementById('workarea')
    workarea.addEventListener('click', (e) => {
      this.$menu.classList.remove('open')
    })
  }

  /**
   * @function createTemplate
   * @param {string} imgPath
   * @returns {any} template
   */

  createTemplate (imgPath) {
    const template = document.createElement('template')
    template.innerHTML = `
    <style>
    :host {
      position:relative;
    }
    .menu-button:hover, se-button:hover, .menu-item:hover
    {
      background-color: var(--icon-bg-color-hover);
    }
    img {
      border: none;
      width: 24px;
      height: 24px;
    }
    .overall.pressed .button-icon,
    .overall.pressed,
    .menu-item.pressed {
      background-color: var(--icon-bg-color-hover) !important;
    }
    .overall.pressed .menu-button {
      background-color: var(--icon-bg-color-hover) !important;
    }
    .disabled {
      opacity: 0.3;
      cursor: default;
    }
    .menu-button {
      height: 24px;
      width: 24px;
      margin: 2px 1px 4px;
      padding: 3px;
      background-color: var(--icon-bg-color);
      cursor: pointer;
      position: relative;
      border-radius: 3px;
      overflow: hidden;
    }
    .handle {
      height: 8px;
      width: 8px;
      background-image: url(${imgPath}/handle.svg);
      position:absolute;
      bottom: 0px;
      right: 0px;
    }
    .button-icon {
    }
    .menu {
      position: fixed;
      margin-left: 34px;
      background: none !important;
      display:none;
      top: 30%;
      left: 34px;
      height: 250px;
      overflow: scroll;
    }
    .image-lib {
      position: fixed;
      left: 34px;
      top: 30%;
      background: #E8E8E8;
      display: none;
      flex-wrap: wrap;
      flex-direction: row;
      width: 170px;
    }
    .menu-item {
      line-height: 1em;
      padding: 0.5em;
      border: 1px solid #5a6162;
      background: #E8E8E8;
      margin-bottom: -1px;
      white-space: nowrap;
    }
    .open-lib {
      display: inline-flex;
    }
    .open {
      display: block;
    }
    .overall {
      background: none !important;
    }
    </style>

    <div class="overall">
      <div class="menu-button">
        <img class="button-icon" src="explorer.svg" alt="icon">
        <div class="handle"></div>
      </div>
      <div id="custommenu" class="menu">

     </div>
    </div>`
    return template
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'pressed', 'disabled', 'customdata', 'src']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  async attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return
    switch (name) {
      case 'title':
        {
          this.$button.setAttribute('title', `${newValue}`)
        }
        break
      case 'pressed':
        if (newValue) {
          this.$overall.classList.add('pressed')
        } else {
          this.$overall.classList.remove('pressed')
        }
        break
      case 'disabled':
        if (newValue) {
          this.$overall.classList.add('disabled')
        } else {
          this.$overall.classList.remove('disabled')
        }
        break
      case 'customdata':
        try {
          var getParameterByName = function(name){
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( window.location.href );
            if (results == null) {
                return "";
            } else {
                return decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        }

        var dataGETURL = getParameterByName('docroot') + '/api/badgedesigner/getVariableTextlist/identityAsset';
        var requestBody = {};
        var header = localStorage["AlertApp-Authorization"];
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
          dynamicTextData = await fetch(dataGETURL, fetchOptions);
          const responseData = await dynamicTextData.json();
          if(responseData && responseData.data && responseData.data.data) {
            this.$menu.innerHTML = responseData.data.data.map((menu, i) => (
              `<div data-menu="${menu.prop}" class="menu-item">${menu.label}</div>`
              )).join('')
          }
        } catch (error) {
          console.error(error)
        }
        break
      case 'src':
        this.$img.setAttribute('src', this.imgPath + '/' + newValue)
        break
      default:
        console.error(`unknown attribute: ${name}`)
        break
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get title () {
    return this.getAttribute('title')
  }

  /**
   * @function set
   * @returns {void}
   */
  set title (value) {
    this.setAttribute('title', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get pressed () {
    return this.hasAttribute('pressed')
  }

  /**
   * @function set
   * @returns {void}
   */
  set pressed (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('pressed', 'true')
    } else {
      this.removeAttribute('pressed', '')
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get disabled () {
    return this.hasAttribute('disabled')
  }

  /**
   * @function set
   * @returns {void}
   */
  set disabled (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('disabled', 'true')
    } else {
      this.removeAttribute('disabled', '')
    }
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */

  connectedCallback () {
    // capture click event on the button to manage the logic
    const onClickHandler = (ev) => {
      ev.stopPropagation()
      switch (ev.target.nodeName) {
        case 'SE-IDENTITYASSETTEXT':
          var childLength = 0;
          if(this.$menu && this.$menu.children) {
            childLength = this.$menu.children.length;
          }
          for(var ci=0; ci < childLength; ci++) {
            this.$menu.children[ci].classList.remove('pressed');
          }
          this.$menu.classList.toggle('open')
          break
        case 'DIV':
          this.customSelectedAttributeName = ev.target.innerHTML;
          this.customSelectedAttributeProp = ev.target.getAttribute('data-menu');
          var childLength = 0;
          if(this.$menu && this.$menu.children) {
            childLength = this.$menu.children.length;
          }
          for(var ci=0; ci < childLength; ci++) {
            this.$menu.children[ci].classList.remove('pressed');
          }
          ev.target.classList.add('pressed');
          break
        default:
          console.error('unknown nodeName for:', ev.target, ev.target.className)
      }
    }
    // capture event from slots
    svgEditor.$click(this, onClickHandler)
    svgEditor.$click(this.$menu, onClickHandler)
    svgEditor.$click(this.$handle, onClickHandler)
  }

}

// Register
customElements.define('se-identityassettext', IdentityAssetText)
