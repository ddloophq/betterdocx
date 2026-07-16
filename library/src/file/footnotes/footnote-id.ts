export const validateFootnoteId = (id: number): number => {
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error(`Invalid footnote id '${id}'. Expected a positive safe integer.`);
    }

    return id;
};

export const parseFootnoteId = (id: string): number => {
    if (!/^[1-9]\d*$/.test(id)) {
        throw new Error(
            `Invalid footnote id '${id}'. Expected a canonical positive integer string.`,
        );
    }

    return validateFootnoteId(Number(id));
};
