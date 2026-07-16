import { Element } from "xml-js";

import { IRenderedParagraphNode, renderParagraphNode } from "./run-renderer";
import { ElementWrapper, traverse } from "./traverser";

type TrieNode = {
    readonly children: Map<string, TrieNode>;
    readonly tokens: string[];
};

const createTrieNode = (): TrieNode => ({ children: new Map(), tokens: [] });

const pathKey = (path: readonly number[]): string => path.join(",");

/**
 * A disposable index for one mutable XML part.
 *
 * Paragraph patches keep paragraph paths stable, so only touched paragraphs
 * need refreshing. Document patches can shift sibling paths and explicitly
 * rebuild the index. This avoids a permanent path cache whose correctness
 * depends on every possible XML mutation.
 */
export class TextLocationIndex {
    private readonly trie = createTrieNode();
    private readonly locationsByToken = new Map<string, Map<string, IRenderedParagraphNode>>();
    private readonly tokensByPath = new Map<string, ReadonlySet<string>>();

    public constructor(
        private readonly root: Element,
        tokens: readonly string[],
    ) {
        for (const token of tokens) {
            this.addToken(token);
        }
        this.rebuild();
    }

    public locations(token: string): readonly IRenderedParagraphNode[] {
        return [...(this.locationsByToken.get(token)?.values() ?? [])];
    }

    public rebuild(): void {
        this.locationsByToken.clear();
        this.tokensByPath.clear();
        for (const paragraph of traverse(this.root)) {
            this.addParagraph(paragraph);
        }
    }

    public refresh(paths: readonly (readonly number[])[]): void {
        for (const path of paths) {
            const key = pathKey(path);
            this.removePath(key);
            this.addParagraph(renderParagraphAtPath(this.root, path));
        }
    }

    private addToken(token: string): void {
        let node = this.trie;
        for (const character of token) {
            let child = node.children.get(character);
            if (child === undefined) {
                child = createTrieNode();
                node.children.set(character, child);
            }
            node = child;
        }
        node.tokens.push(token);
    }

    private matches(text: string): ReadonlySet<string> {
        const found = new Set<string>();
        for (let start = 0; start < text.length; start++) {
            let node = this.trie.children.get(text[start]);
            if (node === undefined) {
                continue;
            }
            for (const token of node.tokens) {
                found.add(token);
            }
            for (let index = start + 1; index < text.length; index++) {
                node = node.children.get(text[index]);
                if (node === undefined) {
                    break;
                }
                for (const token of node.tokens) {
                    found.add(token);
                }
            }
        }
        return found;
    }

    private addParagraph(paragraph: IRenderedParagraphNode): void {
        const key = pathKey(paragraph.pathToParagraph);
        const tokens = this.matches(paragraph.text);
        this.tokensByPath.set(key, tokens);
        for (const token of tokens) {
            let locations = this.locationsByToken.get(token);
            if (locations === undefined) {
                locations = new Map();
                this.locationsByToken.set(token, locations);
            }
            locations.set(key, paragraph);
        }
    }

    private removePath(key: string): void {
        for (const token of this.tokensByPath.get(key) ?? []) {
            const locations = this.locationsByToken.get(token);
            locations?.delete(key);
            if (locations?.size === 0) {
                this.locationsByToken.delete(token);
            }
        }
        this.tokensByPath.delete(key);
    }
}

const renderParagraphAtPath = (root: Element, path: readonly number[]): IRenderedParagraphNode => {
    let wrapper: ElementWrapper = { element: root, index: 0, parent: undefined };
    for (let index = 1; index < path.length; index++) {
        const childIndex = path[index];
        const child = wrapper.element.elements?.[childIndex];
        if (child === undefined) {
            throw new Error(`Patch invalidated paragraph path ${path.join(".")}.`);
        }
        wrapper = { element: child, index: childIndex, parent: wrapper };
    }
    return renderParagraphNode(wrapper);
};
