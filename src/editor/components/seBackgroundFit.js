import { t } from '../locale.js'

export class BackGroundFit extends HTMLElement {
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
      </div>
    </div>`
    return template
  }

    /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'pressed', 'disabled', 'src']
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
      var elem = svgEditor.selectedElement;      
      const canv = svgEditor.svgCanvas
      if(elem.tagName == "text"){
        if(elem.getAttribute('textLength') == null){  
          elem.setAttribute('textLength',elem.getComputedTextLength());
          this.$button.style.background = '#c2c2c2';
          this.$img.setAttribute('src','./images/fittocanvasenabled.svg');             
          this.$button.setAttribute('title', `${t("tools.disable_shrink")}`);
         }
           else {
            this.$button.style.background = '#fff';
            elem.removeAttribute('textLength')
            this.$img.setAttribute('src','./images/fittocanvas.svg');             
            this.$button.setAttribute('title', `${t("tools.enable_shrink")}`);             
          }
        }
        else{
          elem.setAttribute('width', canv.getResolution().w);
          elem.setAttribute('height', canv.getResolution().h);
          elem.setAttribute('x', 0);
          elem.setAttribute('y', 0);
          this.$button.style.background = '#fff';
        }
        canv.setMode('select');
         
    }

    const selectedChanged = () => {
      // Use this to update the current selected elements
      //console.log('selectChanged',opts);
    
      var marker_elems = ['rect', 'image', 'text'];     
     
        var elem = svgEditor.selectedElement;
        
        if (elem && marker_elems.indexOf(elem.tagName) !== -1) {
          if (!svgEditor.multiselected) {
            if(elem.tagName == 'text'){
              if(elem.getAttribute('textLength') != null){                      
                this.$button.style.background = '#c2c2c2';
                this.$img.setAttribute('src','./images/fittocanvasenabled.svg');             
                this.$button.setAttribute('title', `${t("tools.disable_shrink")}`);
              }else{
                this.$button.style.background = '#fff';
                this.$img.setAttribute('src','./images/fittocanvas.svg');             
                this.$button.setAttribute('title', `${t("tools.enable_shrink")}`);                         
              }
            }else{
              this.$button.setAttribute('title', 'Fit to Canvas');
              this.$button.style.background = '#fff';
              this.$img.setAttribute('src','./images/fittocanvasenabled.svg');
            }
            
          } 
        } 
      
    }
    // capture event from slots
    // svgEditor.$click(this, onClickHandler)
    svgEditor.$click(this.$img, onClickHandler);
    svgEditor.$click(this.$button ,selectedChanged);
    
  }
  
  
  
  

  
  }
  
  // Register
  customElements.define('se-backgroundfit', BackGroundFit)