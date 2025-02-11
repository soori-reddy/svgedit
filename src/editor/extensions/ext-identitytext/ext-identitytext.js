/**
 * @file ext-identitytext.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'identitytext'

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

    const modeId = 'identitytext'
    const startClientPos = {}

    let curShape
    let startX
    let startY

    return {
      callback () {
        if ($id('tool_identitytext') === null) {
          const extPath = svgEditor.configObj.curConfig.extPath
          const buttonTemplate = `
          <se-identitytext id="tool_identitytext" title="${svgEditor.i18next.t(`${name}:buttons.0.title`)}"
          src="user.svg" customdata="" ></se-identitytext>
          `
          canv.insertChildAtIndex($id('tools_left'), buttonTemplate, 14)
          $click($id('tool_identitytext'), () => {
            if (this.leftPanel.updateLeftPanel('tool_identitytext')) {
              canv.setMode(modeId)
            }
          })
        }
      },
      mouseDown (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) { return undefined }

        if(document.getElementById('tool_identitytext').customSelectedAttributeName) {
          startX = opts.start_x
          const x = startX
          startY = opts.start_y
          const y = startY
          const curStyle = canv.getStyle()

          startClientPos.x = opts.event.clientX
          startClientPos.y = opts.event.clientY
          var custProp = document.getElementById('tool_identitytext').customSelectedAttributeProp
          if(!custProp) {
            custProp='';
          }
          // text element
          curShape = canv.addSVGElementsFromJson({
            element: 'text',
            curStyles: true,
            attr: {
              x,
              y,
              id: canv.getNextId() + '_'+ custProp,
              fill: canv.getCurText('fill'),
              'stroke-width': canv.getCurText('stroke_width'),
              'font-size': canv.getCurText('font_size'),
              'font-family': canv.getCurText('font_family'),
              'text-anchor': 'middle',
              'xml:space': 'preserve',
              opacity: curStyle.opacity,
              style: 'pointer-events:none'
            },
          })
          curShape.textContent = document.getElementById('tool_identitytext').customSelectedAttributeName;
          document.getElementById('tool_identitytext').customSelectedAttributeName = '';
          document.getElementById('tool_identitytext').customSelectedAttributeProp = '';
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
