/**
 * @file ext-frontbackview.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'backgroundfit'

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
    
        const modeId = 'backgroundfit'
        const startClientPos = {}
    
        let curShape
        let startX
        let startY
    
        return {
          callback () {
    
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