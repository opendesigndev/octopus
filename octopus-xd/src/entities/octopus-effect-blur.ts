import type { RawBlur } from '../typings/source'
import { asBoolean, asNumber } from '../utils/as'


type OctopusEffectBlurOptions = {
  effect: RawBlur
}

export default class OctopusEffectBlur {
  _rawEffect: RawBlur

  constructor(options: OctopusEffectBlurOptions) {
    this._rawEffect = options.effect
  }

  /** @TODO guard return value with updated types */
  convert() {
    const visible = asBoolean(this._rawEffect?.visible, true)

    /** @TODO specific values, such as `opacity` and `brightness` are not represented in current schema. Also, background blur type as such. */

    // {
    //   "id": "EFFECT_ID_3",
    //   "visible": true,
    //   "type": "BLUR",
    //   "blur": 4.0,
    //   "filters": [
    //     {
    //         "visible": true,
    //         "type": "SKETCH_BLUR_BRIGHTNESS",
    //         "colorAdjustment": {
    //             "brightness": 0.1
    //         }
    //     }
    //   ]
    // }


    return {
      type: 'BLUR' as const,
      visible,
      blur: asNumber(this._rawEffect?.params?.blurAmount)
    }  
  }
}