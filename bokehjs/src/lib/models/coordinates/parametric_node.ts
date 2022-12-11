import {Node} from "./node"
import * as p from "core/properties"

export namespace ParametricNode {
  export type Attrs = p.AttrsOf<Props>
  export type Props = Node.Props & {
    t: p.Property<number>
  }
}

export interface ParametricNode extends ParametricNode.Attrs {}

export abstract class ParametricNode extends Node {
  override properties: ParametricNode.Props

  constructor(attrs?: Partial<ParametricNode.Attrs>) {
    super(attrs)
  }

  static {
    this.define<ParametricNode.Props>(({Percent}) => ({
      t: [ Percent ],
    }))
  }
}
