import { ICrawler, EwtnCrawler } from "./EwtnCrawler";
import { KeyValueStore, IKeyValueStore } from "./KeyValueStore";

export interface IReadingsService {
    prepareReadings(): Promise<object[]>;
}

export class ReadingsService implements IReadingsService {
    constructor(private readonly crawler: ICrawler = new EwtnCrawler(),
                private readonly keyValueStore: IKeyValueStore = new KeyValueStore()) {
    }

    public async prepareReadings(): Promise<object[]> {
        const convert  = JSON.stringify;
        const readings = await this.crawler.crawl();
        const saved = readings.map(x => this.keyValueStore.save(x.key, convert(x.readings)));
        return await Promise.all(saved);
    }
}
