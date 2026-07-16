import {
    BaseXmlComponent,
    IContext,
    IXmlableObject,
    createRenderSession,
} from "@file/xml-components";

export type IFormatterContext = IContext;

export class Formatter {
    public format(
        input: BaseXmlComponent,
        context: IFormatterContext = { session: createRenderSession(), stack: [] },
    ): IXmlableObject {
        const output = input.prepForXml(context);

        if (output) {
            return output;
        } else {
            throw Error("XMLComponent did not format correctly");
        }
    }
}
