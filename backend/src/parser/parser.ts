import * as parse5 from "parse5";
import type { DOMNode, DOMTree } from "../types/dom.js";
import { ParserError } from "../types/constants.js";

type Node = parse5.DefaultTreeAdapterMap['node'];
type Element = parse5.DefaultTreeAdapterMap['element'];
const UNIQUE_TAGS = new Set(['html', 'head', 'body', 'title']);

function convertNode(
    node: Node,
    depth: number,
    parentPath: string,
    index: number
): DOMNode | null
{
    if (node.nodeName === '#text' || node.nodeName === '#comment'){
        return null;
    }

    if (!('attrs' in node)) return null; //defense kalo ga sengaja call #document atau #document-fragment

    const element = node as Element;
    const tag = element.nodeName.toLowerCase();

    const id = parentPath === '' 
        ? tag 
        : UNIQUE_TAGS.has(tag) 
            ? `${parentPath}/${tag}`
            : `${parentPath}/${tag}[${index}]`;

    const attributes: Record<string, string> = {};
    for (const attr of element.attrs){
        attributes[attr.name] = attr.value;
    }

    const innerText = element.childNodes
        .filter((c): c is parse5.DefaultTreeAdapterMap['textNode'] => c.nodeName === '#text')
        .map(c => c.value.trim())
        .filter(t => t !== '')
        .join(' ') || undefined;

    const tagCount: Record<string, number> = {};
    const children: DOMNode[] = [];

    for (const child of element.childNodes) {
        if (!('attrs' in child)) continue;

        const childTag = child.nodeName.toLowerCase();
        tagCount[childTag] ??= 0;
        const childIndex = tagCount[childTag];
        tagCount[childTag]++;

        const childNode = convertNode(child, depth + 1, id, childIndex);
        if (childNode !== null) {
        children.push(childNode);
        }
    }

    return {
        id,
        tag,
        attributes,
        children,
        depth,
        ...(innerText !== undefined && { innerText }),
    };
}


export function parseHTML(html: string): DOMTree {
    if (html.trim() === "") throw new Error(ParserError.EMPTY_HTML);
    
    const document = parse5.parse(html);

    const htmlNode = document.childNodes.find(
        node => node.nodeName === 'html'
    );

    if (htmlNode === undefined) throw new Error(ParserError.PARSE_FAILED);

    const root = convertNode(htmlNode, 0, '', 0);

    if (root === null) throw new Error(ParserError.PARSE_FAILED);

    const maxDepth = getMaxDepth(root);

    return { domTree: root, maxDepth};
}
