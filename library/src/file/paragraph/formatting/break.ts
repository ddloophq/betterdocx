// http://officeopenxml.com/WPtextSpecialContent-break.php
import { OnOffElement } from "@file/xml-components";

import { Run } from "../run";
import { Break, BreakType } from "../run/break";

export class PageBreak extends Run {
    public constructor() {
        super({});
        this.root.push(new Break(BreakType.PAGE));
    }
}

export class ColumnBreak extends Run {
    public constructor() {
        super({});
        this.root.push(new Break(BreakType.COLUMN));
    }
}

/**
 * Add page break before the paragraph if there is no one added before.
 */
export class PageBreakBefore extends OnOffElement {
    public constructor(value: boolean = true) {
        super("w:pageBreakBefore", value);
    }
}
