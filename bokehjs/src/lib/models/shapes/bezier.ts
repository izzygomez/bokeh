import {Path, PathView} from "./path"
import {Coordinate, Node, ParametricNode} from "../coordinates"
import * as p from "core/properties"
import {SXY} from "./common"

export class BezierView extends PathView {
  override model: Bezier
  override visuals: Bezier.Visuals

  override *referenced_nodes() {
    yield* super.referenced_nodes()

    const {p0, p1, cp0, cp1} = this.model
    if (p0 instanceof Node)
      yield p0
    if (p1 instanceof Node)
      yield p1
    if (cp0 instanceof Node)
      yield cp0
    if (cp1 instanceof Node)
      yield cp1
  }

  protected _p0: SXY
  protected _p1: SXY
  protected _cp0: SXY
  protected _cp1: SXY | null

  override update_geometry(): void {
    super.update_geometry()

    const {p0, p1, cp0, cp1} = this.model
    if (p0 instanceof Node)
      this._p0 = this.parent.resolve_node(p0)
    if (p1 instanceof Node)
      this._p1 = this.parent.resolve_node(p1)
    if (cp0 instanceof Node)
      this._cp0 = this.parent.resolve_node(cp0)
    if (cp1 == null)
      this._cp1 = null
    else if (cp1 instanceof Node)
      this._cp1 = this.parent.resolve_node(cp1)
  }

  get p0(): SXY {
    return this._p0
  }

  get p1(): SXY {
    return this._p1
  }

  get cp0(): SXY {
    return this._cp0
  }

  get cp1(): SXY | null {
    return this._cp1
  }

  override compute_node(node: Node): {sx: number, sy: number} | null {
    if (node.target != this.model)
      return null

    if (node instanceof ParametricNode) {
      const {t} = node
      const {p0, p1, cp0, cp1} = this

      if (cp1 == null) {
        function qb(p0: number, p1: number, cp0: number) {
          return p0*(1 - t)**2 + 2*cp0*(1 - t)*t + p1*t**2
        }
        return {
          sx: qb(p0.sx, p1.sx, cp0.sx),
          sy: qb(p0.sy, p1.sy, cp0.sy),
        }
      } else {
        function cb(p0: number, p1: number, cp0: number, cp1: number) {
          const mt = 1 - t
          return mt**3*p0 + 3*mt**2*t*cp0 + 3*mt*t**2*cp1 + t**3*p1
        }
        return {
          sx: cb(p0.sx, p1.sx, cp0.sx, cp1.sx),
          sy: cb(p0.sy, p1.sy, cp0.sy, cp1.sy),
        }
      }
    }

    return null
  }

  paint(): void {
    const {ctx} = this.layer

    ctx.beginPath()
    const {p0, p1, cp0, cp1} = this
    ctx.moveTo(p0.sx, p0.sy)

    if (cp1 != null) {
      ctx.bezierCurveTo(cp0.sx, cp0.sy, cp1.sx, cp1.sy, p1.sx, p1.sy)
    } else {
      ctx.quadraticCurveTo(cp0.sx, cp0.sy, p1.sx, p1.sy)
    }

    this.visuals.line.apply(ctx)
  }
}

export namespace Bezier {
  export type Attrs = p.AttrsOf<Props>

  export type Props = Path.Props & {
    p0: p.Property<Coordinate>
    p1: p.Property<Coordinate>
    cp0: p.Property<Coordinate>
    cp1: p.Property<Coordinate | null>
  }

  export type Visuals = Path.Visuals
}

export interface Bezier extends Bezier.Attrs {}

export class Bezier extends Path {
  override properties: Bezier.Props
  override __view_type__: BezierView

  constructor(attrs?: Partial<Bezier.Attrs>) {
    super(attrs)
  }

  static {
    this.prototype.default_view = BezierView

    this.define<Bezier.Props>(({Ref, Nullable}) => ({
      p0: [ Ref(Coordinate) ],
      p1: [ Ref(Coordinate) ],
      cp0: [ Ref(Coordinate) ],
      cp1: [ Nullable(Ref(Coordinate)), null ],
    }))
  }
}
