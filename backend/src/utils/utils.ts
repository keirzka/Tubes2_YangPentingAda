import type { DOMNode } from "../types/dom.js";

export function getMaxDepth(root: DOMNode): number{
    if (root.children.length === 0) return root.depth; 
    let maxDepth = 0;
    for (const child of root.children){
        const childDepth = getMaxDepth(child);
        if (childDepth > maxDepth){
            maxDepth = childDepth;
        }
    }

    return 1 + maxDepth;
}