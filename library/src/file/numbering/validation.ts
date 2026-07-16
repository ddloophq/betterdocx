const MIN_NUMBERING_LEVEL = 0;
const MAX_NUMBERING_LEVEL = 8;

export const validateNumberingLevel = (level: number): number => {
    if (
        !Number.isSafeInteger(level) ||
        level < MIN_NUMBERING_LEVEL ||
        level > MAX_NUMBERING_LEVEL
    ) {
        throw new Error(
            `Invalid numbering level '${level}'. Expected an integer between ${MIN_NUMBERING_LEVEL} and ${MAX_NUMBERING_LEVEL}.`,
        );
    }

    return level;
};

export const validateNumberingStart = (start: number): number => {
    if (!Number.isSafeInteger(start) || start < 0) {
        throw new Error(
            `Invalid numbering start '${start}'. Expected a non-negative safe integer.`,
        );
    }

    return start;
};

export const validateNumberingInstance = (instance: number): number => {
    if (!Number.isSafeInteger(instance) || instance < 0) {
        throw new Error(
            `Invalid numbering instance '${instance}'. Expected a non-negative safe integer.`,
        );
    }

    return instance;
};
