import {Number, NonNegative, PartialStruct} from "core/kinds"
import {Context2d} from "core/util/canvas"
import {BBox} from "core/util/bbox"

export type SXY = {sx: number, sy: number}

export type BorderRadius = typeof BorderRadius["__type__"]
export const BorderRadius = PartialStruct({
  top_left: NonNegative(Number),
  top_right: NonNegative(Number),
  bottom_right: NonNegative(Number),
  bottom_left: NonNegative(Number),
})

export function round_rect(ctx: Context2d, bbox: BBox, br?: BorderRadius): void {
  let top_left = br?.top_left ?? 0
  let top_right = br?.top_right ?? 0
  let bottom_right = br?.bottom_right ?? 0
  let bottom_left = br?.bottom_left ?? 0

  if (top_left != 0 || top_right != 0 || bottom_right != 0 || bottom_left != 0) {
    const {left, right, top, bottom, width, height} = bbox

    // https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-roundrect
    const scale = Math.min(
      width / (top_left + top_right),
      height / (top_right + bottom_right),
      width / (bottom_right + bottom_left),
      height / (top_left + bottom_left),
    )

    if (scale < 1.0) {
      top_left *= scale
      top_right *= scale
      bottom_right *= scale
      bottom_left *= scale
    }

    ctx.beginPath()
    ctx.moveTo(left + top_left, top)
    ctx.lineTo(right - top_right, top)
    ctx.arcTo(right, top, right, top + top_right, top_right)
    ctx.lineTo(right, bottom - bottom_right)
    ctx.arcTo(right, bottom, right - bottom_right, bottom, bottom_right)
    ctx.lineTo(left + bottom_left, bottom)
    ctx.arcTo(left, bottom, left, bottom - bottom_left, bottom_left)
    ctx.lineTo(left, top + top_left)
    ctx.arcTo(left, top, left + top_left, top, top_left)
    ctx.closePath()
  } else {
    const {left, top, width, height} = bbox
    ctx.beginPath()
    ctx.rect(left, top, width, height)
  }
}
