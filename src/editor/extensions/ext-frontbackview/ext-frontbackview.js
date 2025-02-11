/**
 * @file ext-frontbackview.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'frontbackview'

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
    canv.renameCurrentLayer("front_view")
    canv.createLayer('front_view')
		canv.createLayer("back_view")
		canv.setCurrentLayer("front_view")
		canv.setLayerVisibility("back_view", false)
		canv.setLayerVisibility("front_view", true)

    let svgurl = window.location.search;
    if(svgurl) {
      svgurl = svgurl.split('=');
      if(svgurl && svgurl.length > 1) {
        if(svgurl[1] == 'new') {
          this.docprops = true
          const $imgDialog = $id('se-img-prop')

          // update resolution option with actual resolution
          const resolution = this.svgCanvas.getResolution()
          if (this.configObj.curConfig.baseUnit !== 'px') {
            resolution.w =
              convertUnit(resolution.w) + this.configObj.curConfig.baseUnit
            resolution.h =
              convertUnit(resolution.h) + this.configObj.curConfig.baseUnit
          }
          $imgDialog.setAttribute('save', this.configObj.pref('img_save'))
          $imgDialog.setAttribute('width', resolution.w)
          $imgDialog.setAttribute('height', resolution.h)
          $imgDialog.setAttribute('dialog', 'open')
        } else {
          // set modify data to editor
          let fronthtml = localStorage.getItem('svgedit-default-front');
          let backhtml = localStorage.getItem('svgedit-default-back');

          let gtagslist = document.getElementsByTagName('g');
          if(gtagslist && gtagslist.length) {
            for(let gi=0; gi<gtagslist.length;gi++) {
              if(gtagslist[gi]['innerHTML'] && gtagslist[gi]['innerHTML'].indexOf('front_view') != -1) {
                gtagslist[gi]['innerHTML'] = fronthtml;
              }
              if(gtagslist[gi]['innerHTML'] && gtagslist[gi]['innerHTML'].indexOf('back_view') != -1) {
                gtagslist[gi]['innerHTML'] = backhtml;
              }
            }
          }
          let svgwidth = localStorage.getItem('svgedit-width');
          let svgheight = localStorage.getItem('svgedit-height');
          this.svgCanvas.setResolution(svgwidth, svgheight);
          this.updateCanvas();
        }
      }
    }

    let lastBBox = {}
    await loadExtensionTranslation(svgEditor)

    const modeId = 'frontbackview'
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
