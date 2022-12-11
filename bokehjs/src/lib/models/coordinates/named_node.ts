import {Node} from "./node"
import * as p from "core/properties"

export namespace NamedNode {
  export type Attrs = p.AttrsOf<Props>
  export type Props = Node.Props & {
    term: p.Property<string>
  }
}

export interface NamedNode extends NamedNode.Attrs {}

export abstract class NamedNode extends Node {
  override properties: NamedNode.Props

  constructor(attrs?: Partial<NamedNode.Attrs>) {
    super(attrs)
  }

  static {
    this.define<NamedNode.Props>(({String}) => ({
      term: [ String ],
    }))
  }
}
