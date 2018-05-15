import {SNSEventRecord} from "aws-lambda";
import {from} from "rxjs/index";
import {map} from "rxjs/operators";
import {EwtnCrawler, ICrawler, ICrawlingResult} from "./EwtnCrawler";
import {IKeyValueStore, KeyValueStore} from "./KeyValueStore";
import Axios from "axios";
import * as cheerio from "cheerio";

export interface IScrapedReading {
    reference: string;
    type: string;
    text: string;
}

export interface IScrapingResult {
    color: string;
    key: string;
    readings: IScrapedReading[];
}

export interface IScrapingService {
    scrapReadings(records: SNSEventRecord[]): Promise<any>;
}

export default class ScrapingService implements IScrapingService {

    constructor(private readonly crawler: ICrawler = new EwtnCrawler(),
                private readonly keyValueStore: IKeyValueStore = new KeyValueStore()) {
    }

    public async scrapReadings(records: SNSEventRecord[]): Promise<any> {
        const convert = JSON.parse;
        from(records)
            .pipe(map(x => x.Sns.Message))
            .pipe(map(x => convert(x) as ICrawlingResult))
            .pipe(map(x => this.mapToScraped(x)))
            // .pipe()
        ;
    }

    private async mapToScraped(crawled: ICrawlingResult): Promise<IScrapingResult> {
        return {
            ...crawled,
            readings: await Promise.all(crawled.readings.map(x => this.getAndScrap(x))),
        };
    }

    private async getAndScrap(reading: any): Promise<IScrapedReading> {
        const response = await Axios.get(reading.link);
        const $ = cheerio.load(response.data);
        const text = $("span[id].text").toArray()
            .map(x => $(x).html())
            .reduce((agg, x) => `${agg}${x}`, "");
        return {
            text,
            type: reading.type,
            reference: reading.reference,
        };
    }
}
