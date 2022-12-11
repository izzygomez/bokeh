import {Shape, ShapeView} from "./shape"
import {marker_funcs} from "./marker_defs"
import {SXY} from "./common"
import {Coordinate, Node} from "../coordinates"
import {MarkerType} from "core/enums"
import * as mixins from "core/property_mixins"
import * as visuals from "core/visuals"
import * as p from "core/properties"

export class MarkerView extends ShapeView {
  override model: Marker
  override visuals: Marker.Visuals

  override *referenced_nodes() {
    yield* super.referenced_nodes()

    const {center} = this.model
    if (center instanceof Node)
      yield center
  }

  override update_geometry(): void {
    super.update_geometry()

    const {center} = this.model
    if (center instanceof Node)
      this._center = this.parent.resolve_node(center)
  }

  protected _center: SXY

  get center(): SXY {
    return this._center
  }

  paint(): void {
    const {ctx} = this.layer
    const {sx, sy} = this.center
    const {size, variety} = this.model
    ctx.beginPath()
    ctx.translate(sx, sy)
    marker_funcs[variety](ctx, size/2, this.visuals)
    ctx.translate(-sx, -sy)
    this.visuals.line.apply(ctx)
  }
}

export namespace Marker {
  export type Attrs = p.AttrsOf<Props>

  export type Props = Shape.Props & {
    center: p.Property<Coordinate>
    size: p.Property<number>
    variety: p.Property<MarkerType>
  } & Mixins

  export type Mixins = mixins.Line & mixins.Fill & mixins.Hatch

  export type Visuals = Shape.Visuals & {
    line: visuals.Line
    fill: visuals.Fill
    hatch: visuals.Hatch
  }
}

export interface Marker extends Marker.Attrs {}

export class Marker extends Shape {
  override properties: Marker.Props
  override __view_type__: MarkerView

  constructor(attrs?: Partial<Marker.Attrs>) {
    super(attrs)
  }

  static {
    this.prototype.default_view = MarkerView

    this.mixins<Marker.Mixins>([
      mixins.Line,
      mixins.Fill,
      mixins.Hatch,
    ])

    this.define<Marker.Props>(({Ref, NonNegative, Number}) => ({
      center: [ Ref(Coordinate) ],
      size: [ NonNegative(Number) ],
      variety: [ MarkerType ],
    }))
  }
}
