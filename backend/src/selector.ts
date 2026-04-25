import type { DOMNode } from "./types/dom.js";
import { SelectorError } from "./utils/selectorError.js";

// Public types
export type ParentLookup = (node: DOMNode) => DOMNode | undefined;
export type CompiledMatcher = (
  node: DOMNode,
  getParent: ParentLookup
) => boolean;

// AST types
type AttrMatcher = { readonly name: string; readonly value?: string };
type SimpleSelector = {
  tag?: string;
  id?: string;
  readonly classes: string[];
  readonly attrs: AttrMatcher[];
  readonly pseudos: string[];
};
type Combinator = ">" | " " | "+" | "~";
type ComplexSelector = {
  readonly compounds: SimpleSelector[];
  readonly combinators: Combinator[];
};
type SelectorList = readonly ComplexSelector[];

// Token types
type TokenType =
  | "tag"
  | "class"
  | "id"
  | "attribute"
  | "pseudo"
  | "combinator"
  | "comma";
type Token = {
  readonly type: TokenType;
  readonly value: string;
  readonly position: number;
};

// Public API
export function createMatcher(selector: string): CompiledMatcher {
  if (!selector || !selector.trim()) {
    throw new SelectorError("Empty selector", selector ?? "");
  }
  const tokens = tokenize(selector);
  const ast = parseTokens(tokens, selector);
  return (node, getParent) => matchesAny(node, ast, getParent);
}

// Element check

/**
 * Node dianggap element kalau tag-nya tidak berawal '#'
 * (konvensi umum: text node = "#text", comment = "#comment", document = "#document").
 */
function isElement(node: DOMNode): boolean {
  return !node.tag.startsWith("#");
}

/**
 * Hitung posisi node di antara element-siblings-nya. Return null
 * kalau node tidak punya parent (root) atau tidak ditemukan.
 */
function elementSiblingInfo(
  node: DOMNode,
  getParent: ParentLookup
): { elementSiblings: readonly DOMNode[]; elementIndex: number } | null {
  const parent = getParent(node);
  if (!parent) return null;
  const elementSiblings = parent.children.filter(isElement);
  const elementIndex = elementSiblings.indexOf(node);
  if (elementIndex === -1) return null;
  return { elementSiblings, elementIndex };
}

// Tokenizer
function tokenize(selector: string): Token[] {
  const tokens: Token[] = [];
  const isIdentChar = (c: string) => /[\w-]/.test(c);
  let i = 0;

  while (i < selector.length) {
    const c = selector[i];
    const start = i;

    if (c !== undefined && /\s/.test(c)) {
      while (i < selector.length) {
        const ch = selector[i];
        if (ch === undefined || !/\s/.test(ch)) break;
        i++;
      }
      const prev = tokens[tokens.length - 1];
      const nextChar = selector[i];
      const isBoundary =
        !prev ||
        prev.type === "combinator" ||
        prev.type === "comma" ||
        nextChar === undefined ||
        nextChar === ">" ||
        nextChar === "+" ||
        nextChar === "~" ||
        nextChar === ",";
      if (!isBoundary) {
        tokens.push({ type: "combinator", value: " ", position: start });
      }
      continue;
    }

    if (c === ">" || c === "+" || c === "~") {
      tokens.push({ type: "combinator", value: c, position: i });
      i++;
      continue;
    }

    if (c === ",") {
      tokens.push({ type: "comma", value: ",", position: i });
      i++;
      continue;
    }

    if (c === "#") {
      i++;
      let id = "";
      while (i < selector.length) {
        const ch = selector[i];
        if (ch === undefined || !isIdentChar(ch)) break;
        id += ch;
        i++;
      }
      if (!id) throw new SelectorError("Empty ID selector", selector, start);
      tokens.push({ type: "id", value: id, position: start });
      continue;
    }

    if (c === ".") {
      i++;
      let cls = "";
      while (i < selector.length) {
        const ch = selector[i];
        if (ch === undefined || !isIdentChar(ch)) break;
        cls += ch;
        i++;
      }
      if (!cls) throw new SelectorError("Empty class selector", selector, start);
      tokens.push({ type: "class", value: cls, position: start });
      continue;
    }

    if (c === "[") {
      i++;
      let content = "";
      while (i < selector.length) {
        const ch = selector[i];
        if (ch === undefined || ch === "]") break;
        content += ch;
        i++;
      }
      if (selector[i] !== "]") {
        throw new SelectorError("Unclosed attribute selector", selector, start);
      }
      i++;
      if (!content.trim()) {
        throw new SelectorError("Empty attribute selector", selector, start);
      }
      tokens.push({ type: "attribute", value: content, position: start });
      continue;
    }

    if (c === ":") {
      i++;
      if (selector[i] === ":") {
        i++;
        let name = "";
        while (i < selector.length) {
          const ch = selector[i];
          if (ch === undefined || !isIdentChar(ch)) break;
          name += ch;
          i++;
        }
        throw new SelectorError(
          `Pseudo-element "::${name}" is not supported`,
          selector,
          start
        );
      }
      let name = "";
      while (i < selector.length) {
        const ch = selector[i];
        if (ch === undefined || !isIdentChar(ch)) break;
        name += ch;
        i++;
      }
      if (!name) throw new SelectorError("Empty pseudo-class name", selector, start);
      tokens.push({ type: "pseudo", value: name, position: start });
      continue;
    }
    if (c === "*") {
      tokens.push({ type: "tag", value: "*", position: start });
      i++;
      continue;
    }
    if (c !== undefined && /[a-zA-Z]/.test(c)) {
      let tag = "";

      while (i < selector.length) {
        const ch = selector[i];
        if (ch === undefined || !isIdentChar(ch)) break;

        tag += ch;
        i++;
      }

      tokens.push({ type: "tag", value: tag, position: start });
      continue;
    }

    throw new SelectorError(`Unexpected character '${c}'`, selector, i);
  }

  return tokens;
}

// Parser: tokens menjadi AST
const SUPPORTED_PSEUDOS: ReadonlySet<string> = new Set([
  "first-child",
  "last-child",
]);

function parseTokens(tokens: readonly Token[], selector: string): SelectorList {
  if (tokens.length === 0) {
    throw new SelectorError("Empty selector", selector);
  }

  const groups: ComplexSelector[] = [];
  let current: { compounds: SimpleSelector[]; combinators: Combinator[] } = {
    compounds: [],
    combinators: [],
  };
  let compound: SimpleSelector | null = null;

  const ensureCompound = (): SimpleSelector => {
    if (!compound) compound = { classes: [], attrs: [], pseudos: [] };
    return compound;
  };

  const flushCompound = () => {
    if (compound) {
      current.compounds.push(compound);
      compound = null;
    }
  };

  const flushGroup = () => {
    flushCompound();
    if (current.compounds.length === 0) {
      throw new SelectorError("Empty compound in group", selector);
    }
    if (current.combinators.length >= current.compounds.length) {
      throw new SelectorError("Trailing combinator without target", selector);
    }
    groups.push({
      compounds: current.compounds,
      combinators: current.combinators,
    });
    current = { compounds: [], combinators: [] };
  };

  for (const t of tokens) {
    switch (t.type) {
      case "tag": {
        const c = ensureCompound();
        if (c.tag !== undefined) {
          throw new SelectorError(
            "Multiple tag names in one compound",
            selector,
            t.position
          );
        }
        c.tag = t.value;
        break;
      }
      case "id": {
        const c = ensureCompound();

        if (c.id !== undefined) {
          throw new SelectorError(
            "Multiple ID selectors in one compound are not supported",
            selector,
            t.position
          );
        }

        c.id = t.value;
        break;
      }
      case "class":
        ensureCompound().classes.push(t.value);
        break;
      case "attribute":
        ensureCompound().attrs.push(parseAttribute(t.value, selector, t.position));
        break;
      case "pseudo":
        if (!SUPPORTED_PSEUDOS.has(t.value)) {
          throw new SelectorError(
            `Pseudo-class ":${t.value}" is not supported`,
            selector,
            t.position
          );
        }
        ensureCompound().pseudos.push(t.value);
        break;
      case "combinator":
        flushCompound();
        if (current.compounds.length === 0) {
          throw new SelectorError(
            `Leading combinator '${t.value.trim() || "(space)"}'`,
            selector,
            t.position
          );
        }
        current.combinators.push(t.value as Combinator);
        break;
      case "comma":
        flushGroup();
        break;
    }
  }

  flushGroup();
  return groups;
}

function parseAttribute(
  content: string,
  selector: string,
  position: number
): AttrMatcher {
  const eqIdx = content.indexOf("=");

  if (eqIdx === -1) {
    const name = content.trim();

    if (!name) {
      throw new SelectorError("Empty attribute name", selector, position);
    }

    return { name };
  }

  const name = content.substring(0, eqIdx).trim();
  let value = content.substring(eqIdx + 1).trim();

  if (!name) {
    throw new SelectorError("Empty attribute name", selector, position);
  }

  if (!value) {
    throw new SelectorError("Empty attribute value", selector, position);
  }

  const firstChar = value[0];
  const lastChar = value[value.length - 1];

  if (firstChar === '"' || firstChar === "'") {
    if (value.length < 2 || lastChar !== firstChar) {
      throw new SelectorError(
        "Unclosed attribute value quote",
        selector,
        position
      );
    }

    value = value.substring(1, value.length - 1);
  } else if (lastChar === '"' || lastChar === "'") {
    throw new SelectorError(
      "Mismatched attribute value quote",
      selector,
      position
    );
  }
  return { name, value };
}

// Matching
function matchCompound(
  node: DOMNode,
  sel: SimpleSelector,
  getParent: ParentLookup
): boolean {
  if (!isElement(node)) return false;

  if (sel.tag && sel.tag !== "*") {
    if (sel.tag.toLowerCase() !== node.tag.toLowerCase()) return false;
  }

  if (sel.id !== undefined && node.attributes.id !== sel.id) return false;

  if (sel.classes.length > 0) {
    const classAttr = node.attributes.class ?? "";
    const nodeClasses = classAttr.split(/\s+/).filter(Boolean);
    for (const c of sel.classes) {
      if (!nodeClasses.includes(c)) return false;
    }
  }

  for (const attr of sel.attrs) {
    const val = node.attributes[attr.name];
    if (val === undefined) return false;
    if (attr.value !== undefined && val !== attr.value) return false;
  }

  if (sel.pseudos.length > 0) {
    const info = elementSiblingInfo(node, getParent);
    // Root tidak punya parent. Secara semantik CSS, root element
    // adalah first-child & last-child dari document.
    if (info !== null) {
      for (const p of sel.pseudos) {
        if (p === "first-child" && info.elementIndex !== 0) return false;
        if (
          p === "last-child" &&
          info.elementIndex !== info.elementSiblings.length - 1
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Evaluasi complex selector terhadap node.
 * Strategi right-to-left.
 */
function matchesComplex(
  node: DOMNode,
  complex: ComplexSelector,
  getParent: ParentLookup
): boolean {
  const { compounds, combinators } = complex;
  const n = compounds.length;

  const rightMost = compounds[n - 1];
  if (rightMost === undefined) return false;
  if (!matchCompound(node, rightMost, getParent)) return false;
  if (n === 1) return true;

  let candidates: DOMNode[] = [node];

  for (let i = n - 2; i >= 0; i--) {
    const comb = combinators[i];
    const target = compounds[i];
    if (comb === undefined || target === undefined) return false;
    const next: DOMNode[] = [];

    for (const cand of candidates) {
      if (comb === ">") {
        const p = getParent(cand);
        if (p && matchCompound(p, target, getParent)) next.push(p);
      } else if (comb === " ") {
        let p = getParent(cand);
        while (p) {
          if (matchCompound(p, target, getParent)) next.push(p);
          p = getParent(p);
        }
      } else if (comb === "+") {
        // Adjacent element sibling. Text/comment node di antara diabaikan.
        const info = elementSiblingInfo(cand, getParent);
        if (info && info.elementIndex > 0) {
          const prev = info.elementSiblings[info.elementIndex - 1];
          if (prev !== undefined && matchCompound(prev, target, getParent)) {
            next.push(prev);
          }
        }
      } else if (comb === "~") {
        // General element sibling. Semua element sebelum cand di level sama.
        const info = elementSiblingInfo(cand, getParent);
        if (info) {
          for (let j = info.elementIndex - 1; j >= 0; j--) {
            const prev = info.elementSiblings[j];
            if (prev !== undefined && matchCompound(prev, target, getParent)) {
              next.push(prev);
            }
          }
        }
      }
    }

    if (next.length === 0) return false;
    candidates = next;
  }

  return true;
}

function matchesAny(
  node: DOMNode,
  list: SelectorList,
  getParent: ParentLookup
): boolean {
  for (const complex of list) {
    if (matchesComplex(node, complex, getParent)) return true;
  }
  return false;
}