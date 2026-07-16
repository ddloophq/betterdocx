// http://officeopenxml.com/WPalignment.php
// http://officeopenxml.com/WPtableAlignment.php
import { XmlAttributeComponent, XmlComponent } from "@file/xml-components";

export class WordWrapAttributes extends XmlAttributeComponent<{ readonly val: 0 | 1 }> {
    protected readonly xmlKeys = { val: "w:val" };
}

export class WordWrap extends XmlComponent {
    public constructor(allowMidWordBreak: boolean = true) {
        super("w:wordWrap");
        this.root.push(new WordWrapAttributes({ val: allowMidWordBreak ? 0 : 1 }));
    }
}
