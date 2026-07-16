/**
 * Thrown by `patchDocument` when a placeholder token given in `patches` does
 * not appear anywhere in the document. Pass `onMissingToken: "skip"` to make
 * absent placeholders non-fatal, or call `listPlaceholders` beforehand to build
 * a patch map containing only the placeholders the template actually has.
 */
export class TokenNotFoundError extends Error {
    public override readonly name = "TokenNotFoundError";

    public constructor(public readonly token: string) {
        super(`Token "${token}" was not found in the document.`);
    }
}
