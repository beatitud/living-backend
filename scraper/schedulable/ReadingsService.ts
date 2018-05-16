import {ICrawler, EwtnCrawler, ICrawlingResult} from "./EwtnCrawler";
import { KeyValueStore, IKeyValueStore } from "./KeyValueStore";
import { flatten, isEmpty, get} from "lodash";
import {defer} from "rxjs/internal/observable/defer";
import {filter, flatMap, map, reduce} from "rxjs/operators";
import isNil = require("lodash/fp/isNil");
import * as AWS from "aws-sdk";
import {PublishInput} from "aws-sdk/clients/sns";
import {AWSError} from "aws-sdk";

export interface IReadingsService {
    prepareReferences(): Promise<ICrawlingResult[]>;
    propagateReferences(references: ICrawlingResult[]): Promise<object>;
}

export class ReadingsService implements IReadingsService {

    private readonly versionKeys: ReadonlyArray<string> = [
        // ENGLISH
        "NRSVCE",
        "ESV",
        "NRSV",
        // FRENCH
        "NEG1979",
        "SG21",
        // SPANISH
        "LBLA",
        "JBS",
        // GERMAN
        "HOF",
        // HEBREW
        "WLC",
        // ARABIC
        "ERV-AR",
        // POLISH
        "UBG",
        // RUSSIAN
        "RUSV",
        "NRT",
    ];

    constructor(private readonly crawler: ICrawler = new EwtnCrawler(),
                private readonly keyValueStore: IKeyValueStore = new KeyValueStore()) {
    }

    public async propagateReferences(references: ICrawlingResult[]): Promise<any> {
        const sns = new AWS.SNS();
        const targetArn = get(process, "env.PROPAGATION_TOPIC");
        const publish = {TargetArn: targetArn} as PublishInput;
        return await Promise.all(
            references
                .map(x => JSON.stringify(x))
                .map(x => sns.publish({...publish, Message: x})
                                        .promise()
                                        .catch(e => this.handleError(e))),
        );
    }

    public async prepareReferences(): Promise<ICrawlingResult[]> {
        const convert = JSON.stringify;
        const isNotNil = x => !isNil(x);
        const readings = defer(() => this.crawler.crawl())
            .pipe(flatMap(x => x))
            .pipe(flatMap(async x => ({
                hasKey: await this.keyValueStore.hasKey(x.key),
                origin: x,
            })))
            .pipe(filter( x => !x.hasKey))
            .pipe(map(x => x.origin))
            .pipe(flatMap(async x => ({
                readings: x,
                save: await this.keyValueStore.save(x.key, convert(x.readings)),
            })))
            .pipe(map(x => x.readings))
            .pipe(reduce((acc: ICrawlingResult[], x: ICrawlingResult) => [...acc, x], []))
            .pipe(map(x => this.fillReadingsWithLinks(x).filter(isNotNil)))
            .toPromise();
        return await readings;
    }

    // noinspection JSMethodCanBeStatic
    private handleError(e: AWSError) {
        console.error("fatal: ", JSON.stringify(e));
        return null;
    }

    private fillReadingsWithLinks(readings: ICrawlingResult[]): ICrawlingResult[] {
        const passageLink = "https://www.biblegateway.com/passage/";
        if (isEmpty(readings)) {
            return [];
        }
        const result = this.versionKeys.map(x => readings.map(y => ({
            ...y,
            key: `${y.key.split("data.json")[0]}${x}/data.json`,
            readings: y.readings.map(z => ({
                ...z,
                link: `${passageLink}?search=${encodeURIComponent(z.reference)}&version=${x}`,
            })),
        })));
        return flatten(result);
    }
}
