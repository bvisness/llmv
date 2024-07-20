/**
 * DOM utilities to ease the pain of document.createElement.
 */

type NonNull<T> = T extends null ? never : T;
type CopyNullable<Src, Dst> = Src extends null ? Dst | null : NonNull<Dst>;
type Falsy = null | undefined | false;

/**
 * A slightly relaxed Node type for my DOM utilities.
 */
export type BNode = Node | string | null;

/**
 * One or more BNodes.
 */
export type BNodes = BNode | BNode[]

/**
 * Ensures a DOM Node.
 */
export function N<T extends BNode>(v: T): CopyNullable<T, Node> {
  if (typeof v === "string") {
    return document.createTextNode(v);
  }
  return v as any;
}

/**
 * Adds children to a DOM node.
 */
export function addChildren(n: Node, children: BNodes) {
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child) {
        n.appendChild(N(child));
      }
    }
  } else {
    if (children) {
      n.appendChild(N(children));
    }
  }
}

/**
 * Creates a DOM element.
 * @param type The type of DOM element to create (e.g. `"div"`)
 * @param classes Any classes to add to the element
 * @param children Any children to add to the element
 */
export function E(type: string, classes?: (string | Falsy)[], children?: BNodes): HTMLElement {
  const el = document.createElement(type);
  if (classes && classes.length > 0) {
    const actualClasses: string[] = classes.filter((c): c is string => !!c);
    el.classList.add(...actualClasses);
  }
  if (children) {
    addChildren(el, children);
  }
  return el;
}

/**
 * Creates a DOM fragment.
 * @param children
 */
export function F(children: BNodes): DocumentFragment {
  const f = document.createDocumentFragment();
  addChildren(f, children);
  return f;
}
