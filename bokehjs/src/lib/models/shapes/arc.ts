import {Path, PathView} from "./path"
import {Coordinate} from "../coordinates/coordinate"
import {Node} from "../coordinates/node"
import {AngleUnits, Direction} from "core/enums"
import {resolve_angle} from "core/util/math"
import * as p from "core/properties"
import {SXY} from "./common"

export class ArcView extends PathView {
  override model: Arc
  override visuals: Arc.Visuals

  override *referenced_nodes() {
    yield* super.referenced_nodes()
    const {center} = this.model
    if (center instanceof Node)
      yield center
  }

  override update_geometry(): void {
    super.update_geometry()
    const {center, start_angle, end_angle, anticlock} = this
    const {radius} = this.model
    this._geometry = {center, radius, start_angle, end_angle, anticlock}
  }

  protected _geometry: {
    center: SXY
    radius: number
    start_angle: number
    end_angle: number
    anticlock: boolean
  }

  get center(): SXY {
    const {center} = this.model
    if (center instanceof Node)
      return this.parent.resolve_node(center)
    else
      return {sx: NaN, sy: NaN}
  }

  get anticlock(): boolean {
    return this.model.direction == "anticlock"
  }

  get start_angle(): number {
    const {start_angle, angle_units} = this.model
    return resolve_angle(start_angle, angle_units)
  }

  get end_angle(): number {
    const {start_angle, angle_units} = this.model
    return resolve_angle(start_angle, angle_units)
  }

  paint(): void {
    const {ctx} = this.layer
    const {center, radius, start_angle, end_angle, anticlock} = this._geometry
    const {sx, sy} = center
    ctx.beginPath()
    ctx.arc(sx, sy, radius, start_angle, end_angle, anticlock)
    this.visuals.line.apply(ctx)
  }
}

export namespace Arc {
  export type Attrs = p.AttrsOf<Props>

  export type Props = Path.Props & {
    center: p.Property<Coordinate>
    radius: p.Property<number>
    //radius_dimension: p.Property<RadiusDimension>
    start_angle: p.Property<number>
    end_angle: p.Property<number>
    angle_units: p.Property<AngleUnits>
    direction: p.Property<Direction>
  }

  export type Visuals = Path.Visuals
}

export interface Arc extends Arc.Attrs {}

export class Arc extends Path {
  override properties: Arc.Props
  override __view_type__: ArcView

  constructor(attrs?: Partial<Arc.Attrs>) {
    super(attrs)
  }

  static {
    this.prototype.default_view = ArcView

    this.define<Arc.Props>(({Ref, NonNegative, Number, Angle}) => ({
      center: [ Ref(Coordinate) ],
      radius: [ NonNegative(Number) ],
      //radius_dimension: [ RadiusDimension, "x" ],
      start_angle: [ Angle ],
      end_angle: [ Angle ],
      angle_units: [ AngleUnits, "rad" ],
      direction: [ Direction, "anticlock" ],
    }))
  }
}
