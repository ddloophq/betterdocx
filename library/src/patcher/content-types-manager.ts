import { Element } from "xml-js";

import { getFirstLevelElements } from "./util";

export const appendContentType = (
    element: Element,
    contentType: string,
    extension: string,
): void => {
    const relationshipElements = getFirstLevelElements(element, "Types");

    const exist = relationshipElements.some(
        (el) =>
            el.type === "element" &&
            el.name === "Default" &&
            el?.attributes?.ContentType === contentType &&
            el?.attributes?.Extension === extension,
    );
    if (exist) {
        return;
    }

    relationshipElements.push({
        attributes: {
            ContentType: contentType,
            Extension: extension,
        },
        name: "Default",
        type: "element",
    });
};

export const appendOverrideContentType = (
    element: Element,
    partName: string,
    contentType: string,
): void => {
    const typesElements = getFirstLevelElements(element, "Types");

    const exist = typesElements.some(
        (el) =>
            el.type === "element" &&
            el.name === "Override" &&
            el?.attributes?.PartName === partName,
    );
    if (exist) {
        return;
    }

    typesElements.push({
        attributes: {
            ContentType: contentType,
            PartName: partName,
        },
        name: "Override",
        type: "element",
    });
};
