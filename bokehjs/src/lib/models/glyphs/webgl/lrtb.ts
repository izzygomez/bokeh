import {Arrayable} from "core/types"
import {Transform} from "./base"
import {MarkerVisuals} from "./base_marker"
import {Float32Buffer} from "./buffer"
import {ReglWrapper} from "./regl_wrap"
import {SingleMarkerGL} from "./single_marker"
import type {GlyphView} from "../glyph"

// BlockView | HBarView | QuadView | VBarView | HBandView | VBandView
type AnyLRTBView = GlyphView & {
  glglyph?: SingleMarkerGL
  visuals: MarkerVisuals
  sright: Arrayable<number>
  sbottom: Arrayable<number>
  sleft: Arrayable<number>
  stop: Arrayable<number>
}

export class LRTBGL extends SingleMarkerGL {
  constructor(regl_wrapper: ReglWrapper, override readonly glyph: AnyLRTBView) {
    super(regl_wrapper, glyph)
  }

  override draw(indices: number[], main_glyph: AnyLRTBView, transform: Transform): void {
    this._draw_impl(indices, transform, main_glyph.glglyph!, "square")
  }

  protected override _get_visuals(): MarkerVisuals {
    return this.glyph.visuals
  }

  protected override _set_data(): void {
    const nmarkers = this.nvertices

    if (this._centers == null) {
      const {regl_wrapper} = this

      // Either all or none are set.
      this._centers = new Float32Buffer(regl_wrapper)
      this._widths = new Float32Buffer(regl_wrapper)
      this._heights = new Float32Buffer(regl_wrapper)

      this._angles = new Float32Buffer(regl_wrapper)
      this._angles.set_from_scalar(0)
    }

    const centers_array = this._centers.get_sized_array(nmarkers*2)
    const heights_array = this._heights!.get_sized_array(nmarkers)
    const widths_array = this._widths!.get_sized_array(nmarkers)

    const {sleft, sright, stop, sbottom} = this.glyph
    const {missing_point} = SingleMarkerGL

    for (let i = 0; i < nmarkers; i++) {
      const l = sleft[i]
      const r = sright[i]
      const t = stop[i]
      const b = sbottom[i]

      if (isFinite(l + r + t + b)) {
        centers_array[2*i] = (l + r)/2
        centers_array[2*i+1] = (t + b)/2
        heights_array[i] = Math.abs(t - b)
        widths_array[i] = Math.abs(r - l)
      } else {
        centers_array[2*i] = missing_point
        centers_array[2*i+1] = missing_point
        heights_array[i] = missing_point
        widths_array[i] = missing_point
      }
    }

    this._centers.update()
    this._heights!.update()
    this._widths!.update()
  }
}
