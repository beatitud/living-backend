import {SNSEventRecord} from "aws-lambda";
import {from} from "rxjs/index";
import {map, flatMap, reduce} from "rxjs/operators";
import {ICrawlingResult} from "./EwtnCrawler";
import {IKeyValueStore, KeyValueStore} from "./KeyValueStore";
import Axios, {AxiosInstance} from "axios";
import * as cheerio from "cheerio";
import {PutObjectOutput} from "aws-sdk/clients/s3";

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

    constructor(private readonly keyValueStore: IKeyValueStore = new KeyValueStore(),
                private readonly httpClient: AxiosInstance = Axios) {
    }

    public async scrapReadings(records: SNSEventRecord[]): Promise<any> {
        const convert = JSON.parse;
        return from(records)
            .pipe(map(x => x.Sns.Message))
            .pipe(map(x => convert(x) as ICrawlingResult))
            .pipe(flatMap(x => this.mapToScraped(x)))
            .pipe(flatMap(x => this.saveReadings(x)))
            .pipe(reduce((acc: PutObjectOutput[], x: PutObjectOutput) => [...acc, x], []))
            .toPromise()
        ;
    }

    private async saveReadings(scrapingResult: IScrapingResult): Promise<PutObjectOutput> {
         return await this.keyValueStore
             .save(scrapingResult.key, JSON.stringify(scrapingResult));
    }

    private async mapToScraped(crawled: ICrawlingResult): Promise<IScrapingResult> {
        const readings = crawled.readings
            .map(x => this.getAndScrap(x));
        return {
            ...crawled,
            readings: await Promise.all(readings),
        };
    }

    // noinspection JSMethodCanBeStatic
    private removeFootNotes(html: string): string {
        const result = html.replace(/\[[^\]]+]/gi, "");
        return result;
    }

    private async getAndScrap(reading: any): Promise<IScrapedReading> {
        const response = await this.httpClient.get(reading.link);
        const $ = cheerio.load(response.data);
        const text = $("p>span.text").toArray()
            .map(x => $(x).parent().html())
            .map(x => this.removeFootNotes(x))
            .reduce((agg, x) => `${agg}${x}`, "");
        return {
            text,
            type: reading.type,
            reference: reading.reference,
        };
    }
}
