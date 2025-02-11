/**
 * @file ext-imageimport.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'imageimport'

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

    const modeId = 'imageimport'
    const startClientPos = {}

    let curShape
    let startX
    let startY

    return {
      callback () {
        if ($id('tool_imageimport') === null) {
          const extPath = svgEditor.configObj.curConfig.extPath
          const buttonTemplate = `
          <se-imageimport id="tool_imageimport" title="${svgEditor.i18next.t(`${name}:buttons.0.title`)}"
          src="image-add.svg" customdata="" ></se-imageimport>
          `
          canv.insertChildAtIndex($id('tools_left'), buttonTemplate, 14)
          $click($id('tool_imageimport'), () => {
            if (this.leftPanel.updateLeftPanel('tool_imageimport')) {
              canv.setMode(modeId)
            }
          })
        }
      },
      mouseDown (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) { return undefined }
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
