import {getReferencesLinks, IEndpoint} from "./tools";
import axios from "axios";
import {get, isNil} from "lodash";
import { Endpoint } from "aws-sdk";

export interface ICrawlingResult {
    color: string;
    key: string;
    readings: Array<{reference: string; type: string, link?: string}>;
}

export interface ICrawler {
    crawl(): Promise<ICrawlingResult[]>;
}

export class EwtnCrawler implements ICrawler {

    public async crawl(): Promise<ICrawlingResult[]> {
        const links = getReferencesLinks().map(x => this.mapWithPageContent(x));
        const responses = await Promise.all(links).catch(e => null);
        const result = responses
            .map(x => this.extractReferences(x))
            .filter(x => !isNil(x)) as ICrawlingResult[];
        return result;
    }
    private extractReferences(endpoint: IEndpoint): ICrawlingResult {
        const color    = get(endpoint.data, "Color");
        const readings = get(endpoint.data, "ReadingGroups[0].Readings", [])
            .map(x => ({
                reference: get(x, "Citations[0].Reference"),
                type: get(x, "Type", "").replace(/ /g, ""),
            }))
            .map(x => isNil(x.reference) ? null : x )
            .filter(x => !isNil(x));
        return {color, readings, key: endpoint.key};
    }

    private async mapWithPageContent(endpoint: IEndpoint) {
        try {
            const response = await axios.get(endpoint.url).catch(this.processError);
            if (get(response, "statusText") !== "OK") { return null; }
            return {data: response.data, ...endpoint} as IEndpoint;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    // noinspection JSMethodCanBeStatic
    private async processError(e) {
        console.error(e);
        return null;
    }
}
