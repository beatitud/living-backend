import {getLinks, IEndpoint} from "./tools";
import axios from "axios";
import {get} from "lodash";

export interface IScraper {
    scrap(): Promise<any>;
}

export class UniversalisScraper implements IScraper {

    constructor(readonly baseUrl: string = "http://universalis.com/") {}

    public async scrap() {
        const responses = await Promise.all(getLinks(this.baseUrl).map(x => this.mapWithPageContent(x)));
        console.log(responses);
    }

    private async mapWithPageContent(endpoint: IEndpoint) {
        const response = await axios.get(endpoint.url).catch(this.processError);
        if (get(response, "statusText") !== "OK") { return null; }
        return {html: response.data, ...endpoint};
    }

    // noinspection JSMethodCanBeStatic
    private async processError(e) {
        console.error(e);
        return null;
    }
}

(new UniversalisScraper().scrap());
