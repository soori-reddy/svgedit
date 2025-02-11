/**
 * @file ext-dynamicphoto.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'dynamicphoto'

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('./locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

export default {
  name,
  async init () {
    const svgEditor = this
    const canv = svgEditor.svgCanvas
    const { $id, $click } = canv
    const svgroot = canv.getSvgRoot()
    let lastBBox = {}
    await loadExtensionTranslation(svgEditor)

    const modeId = 'dynamicphoto'
    const startClientPos = {}

    let curShape
    let startX
    let startY

    return {
      callback () {
        if ($id('tool_dynamicphoto') === null) {
          const extPath = svgEditor.configObj.curConfig.extPath
          const buttonTemplate = `
          <se-dynamicphoto id="tool_dynamicphoto" title="${svgEditor.i18next.t(`${name}:buttons.0.title`)}"
          src="image.svg" customdata="" ></se-dynamicphoto>
          `
          canv.insertChildAtIndex($id('tools_left'), buttonTemplate, 14)
          $click($id('tool_dynamicphoto'), () => {
            if (this.leftPanel.updateLeftPanel('tool_dynamicphoto')) {
              canv.setMode(modeId)
            }
          })
        }
      },
      mouseDown (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) { return undefined }

        if(document.getElementById('tool_dynamicphoto').customSelectedAttributeName) {
          startX = opts.start_x
          const x = startX
          startY = opts.start_y
          const y = startY

          startClientPos.x = opts.event.clientX
          startClientPos.y = opts.event.clientY
          var custProp = document.getElementById('tool_dynamicphoto').customSelectedAttributeProp
          var hrefData = '';
          var height = 100;
          var width = 100;
          if(custProp == 'Photo') {
            hrefData = './images/dummyphoto.jpg';
            height = 130;
            width = 111;
          } else if(custProp == 'BarCode') {
            hrefData = './images/BarCode.jpg';
            height = 46;
            width = 196;
          } else if(custProp == 'QRCode') {
            hrefData = './images/QRCode.jpg';
            height = 99;
            width = 99;
          } else if(custProp == 'VisitorQRCode') {
            hrefData = './images/VisitorQRCode.jpg';
            height = 99;
            width = 99;
          } else if(custProp == 'VisitorPhoto') {
            hrefData = './images/VisitorPhoto.jpg';
            height = 130;
            width = 111;
          } else {
            hrefData = './images/dummyphoto.jpg';
            height = 130;
            width = 111;
          }

          // text element
          curShape = canv.addSVGElementsFromJson({
            element: 'image',
            curStyles: false,
            attr: {
              x,
              y,
              height: height,
              width: width,
              id: canv.getNextId() + '_'+ custProp,
              "xlink:href": hrefData,
              "class": "noedit",
              "preserveAspectRatio": "none"
            },
          })
          curShape.textContent = document.getElementById('tool_dynamicphoto').customSelectedAttributeName;
          document.getElementById('tool_dynamicphoto').customSelectedAttributeName = '';
          document.getElementById('tool_dynamicphoto').customSelectedAttributeProp = '';
          return {
            started: true
          }
        }
      },
      mouseMove (opts) {

      },
      mouseUp (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) { return undefined }
        canv.setMode('select');
        return {
          keep: true,
          element: curShape,
          started: false
        }
      }
    }
  }
}
