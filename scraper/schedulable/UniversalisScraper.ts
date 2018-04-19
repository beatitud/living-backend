import {getEwtnLinks, IEndpoint} from "./tools";
import axios from "axios";
import {get, isNil} from "lodash";
import {load} from "cheerio";
import { Endpoint } from "aws-sdk";

export interface ICrawler {
    crawl(): Promise<any>;
}

export class EwtnCrawler implements ICrawler {

    private readingPattern = /(?:reading|psalm|gospel)/gi;

    public async crawl() {
        const links = getEwtnLinks().map(x => this.mapWithPageContent(x));
        const responses = await Promise.all(links).catch(e => null);
        const result = responses
            .map(x => this.extractReferences(x))
            .filter(x => !isNil(x));
        console.log(JSON.stringify(result));
    }
    private extractReferences(endpoint: IEndpoint) {
        const color    = get(endpoint.data, "Color");
        const readings = get(endpoint.data, "ReadingGroups[0].Readings", [])
            .map(x => ({
                reference: get(x, "Citations[0].Reference"),
                type: get(x, "Type", "").replace(/ /g, ""),
            }))
            .map(x => isNil(x.reference) ? null : x )
            .filter(x => !isNil(x));
        return {color, readings, key: endpoint.key};
        // console.log(title);
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

(new EwtnCrawler().crawl());
