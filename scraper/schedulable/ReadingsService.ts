import { ICrawler, EwtnCrawler } from "./EwtnCrawler";

export interface IReadingsService {
    prepareReadings(): Promise<any>;
}

export class ReadingsService implements IReadingsService {
    constructor(private readonly crawler: ICrawler = new EwtnCrawler()) {
    }

    public async prepareReadings(): Promise<any> {
        const readings = await this.crawler.crawl();


    }
}
