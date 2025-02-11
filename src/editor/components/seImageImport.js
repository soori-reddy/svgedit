/* globals svgEditor */

/**
 * @class ImageImport
 */
export class ImageImport extends HTMLElement {
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
    // this.$menu = this._shadowRoot.querySelector('.menu')
    // this.$handle = this._shadowRoot.querySelector('.handle')
    this.files = []
    this.request = new XMLHttpRequest()
    this.imgPath = svgEditor.configObj.curConfig.imgPath
    this.canv = svgEditor.svgCanvas;
    this.$fileinput  = this._shadowRoot.getElementById('fileInput')
    var me = this;

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

  function handleUploadFilesInternal(files,cb) {
    if (files && files.length > 0) {
      var model = {
        text: files[0].name,
        size: files[0].size,
        mimeType: files[0].type,
        createdOn: new Date(),
        createdBy: 1,
      };
      model.phantom = true;
      var _myThis={cb:cb};
      uploadFile(files[0], model,{uploadCompleted: handleUploadComplete.bind(_myThis)});
    }
  }

  function uploadFile(file, attachmentModel, options) {
    options = options || {};
    var htmlFileForm = new FormData();
    htmlFileForm.append("title", file.name);
    htmlFileForm.append("file", file);
    htmlFileForm.append("tHeight", 175);
    htmlFileForm.append("tWidth", 250);
    var xhr = new XMLHttpRequest();
    xhr.attachmentModel = attachmentModel;
    xhr.addEventListener("load", options.uploadCompleted, false);
    xhr.open("POST", getParameterByName('docroot') + "/api/binaryresource/upload" );
    var autHeader = localStorage.getItem('AlertApp-Authorization');
    xhr.setRequestHeader('Authorization', autHeader)
    xhr.send(htmlFileForm);
        }

  function handleUploadComplete(event) {
    if (event == 413) {
    } else {
      var response = JSON.parse(event.target.response);
      if (response && response.success) {
        this.cb(response);
      }
    }
  }

  function downscaleImage(dataUrl, svgCanvasWidth ,imageType, imageArguments) {
      var image, oldWidth, oldHeight, newWidth, newHeight, canvas, ctx, newDataUrl;

      // Provide default values
      imageType = imageType || "image/png";
      imageArguments = imageArguments || 0.7;

      // Create a temporary image so that we can compute the height of the downscaled image.
      image = new Image();
      image.src = dataUrl;
      oldWidth = image.width;
      oldHeight = image.height;

      if(svgCanvasWidth && oldWidth > svgCanvasWidth){
        newWidth = svgCanvasWidth;
        newHeight = Math.floor(oldHeight / oldWidth * newWidth)

        // Create a temporary canvas to draw the downscaled image on.
        canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the downscaled image on the canvas and return the new data URL.
        ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        newDataUrl = canvas.toDataURL(imageType, imageArguments);
        return newDataUrl;
      }else{
        return dataUrl;
      }
  }

    this.imageimportouter = this._shadowRoot.getElementById('imageimport_outer')
    this.imageimportouter.addEventListener('click', function(event) {
      // this.children[0].children[0].click()
      me.$fileinput.click();
    });

    this.$fileinput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      me.files=[];
      me.files.push(file);

      // Handle the selected file, for example:
      console.log('Selected file:', file);

      e.stopPropagation();
      e.preventDefault();
      // var file = (e.type == 'drop') ? e.dataTransfer.files[0] : this.files[0];
      if (!file) {
        return;
      }
      if (file.type.indexOf('image') != -1) {
        // Detected an image
        // svg handling
        var reader;
        if (file.type.indexOf('svg') != -1) {
          reader = new FileReader();
          reader.onloadend = function(e) {
            svgEditor.svgCanvas.setSvgString(e.target.result);
            svgEditor.svgCanvas.setCurrentLayer("front_view");
            svgEditor.svgCanvas.setLayerVisibility("back_view", false);
            svgEditor.svgCanvas.setLayerVisibility("front_view", true);
          };
          reader.readAsText(file);
        } else {
        //bitmap handling
            handleUploadFilesInternal(me.files, (response)=>{
          reader = new FileReader();
          reader.onloadend = function(e) {
            // let's insert the new image until we know its dimensions
            var insertNewImage = function(width, height) {
              var newImage = svgEditor.svgCanvas.addSVGElementsFromJson({
                element: 'image',
                attr: {
                  x: 0,
                  y: 0,
                  width: width,
                  height: height,
                  id: svgEditor.svgCanvas.getNextId(),
                  style: 'pointer-events:inherit'
                }
              });
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
              //svgEditor.svgCanvas.setHref(newImage,downscaleImage(e.target.result , svgEditor.svgCanvas.getResolution().w));
              var bearerToken = localStorage.getItem('AlertApp-Authorization');
              var downloadUrl = getParameterByName('docroot') + "/api/binaryresource/download/" + response.data.id + "?Authorization="+bearerToken;
              svgEditor.svgCanvas.setHref(newImage, downloadUrl);
              svgEditor.svgCanvas.selectOnly([newImage]);
              svgEditor.svgCanvas.alignSelectedElements('m', 'page');
              svgEditor.svgCanvas.alignSelectedElements('c', 'page');
              //newImage.dataset['binaryId'] = response.data.id;
              newImage.setAttribute('data-binary-id',response.data.id);
              //updateContextPanel();
            };
              // create dummy img so we know the default dimensions
            var imgWidth = 100;
            var imgHeight = 100;
            var img = new Image();
            img.src = e.target.result;
            img.style.opacity = 0;
            img.onload = function() {
              imgHeight = img.naturalHeight;
              imgWidth = img.naturalWidth;
              insertNewImage(imgWidth, imgHeight);
            };
          };
          reader.readAsDataURL(file);
            });
        }
      }

    });

    // Closes opened (pressed) lib menu on click on the canvas
    const workarea = document.getElementById('workarea')
    workarea.addEventListener('click', (e) => {
      // this.$menu.classList.remove('open')
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

    <div class="overall" id="imageimport_outer">
      <div class="menu-button">
        <input type="file" id="fileInput" style="display: contents;">
        <img class="button-icon" src="image.svg" alt="icon">
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


    // capture event from slots
    // svgEditor.$click(this, importImage)

    // svgEditor.$click(this.$menu, importImage)
    // svgEditor.$click(this.$handle, importImage)
  }

}

// Register
customElements.define('se-imageimport', ImageImport)
