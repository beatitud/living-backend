import { expect } from "chai";
import {random} from "faker";
import sinon = require("sinon");
import ScrapingService from "../../src/ScrapingService";
import {PutObjectOutput} from "aws-sdk/clients/s3";
import * as cheerio from "cheerio";
import * as fs from "fs";

describe("Scraping service component specs", async () => {

    const str = JSON.stringify;
    const alpha = () => random.alphaNumeric(1024);
    const getFileContent = (x) => fs.readFileSync(x).toString();

    it("should extract only unique verses from markup", async () => {
        // Arrange
        const $$            = cheerio.load;
        const json          = JSON.parse;
        const link          = alpha();
        const crawling      = {key: alpha(), readings: [{link}]};
        const record        = {Sns: {Message: str(crawling)}};
        const httpClient    = { get: sinon.stub() };
        const keyValueStore = { save: sinon.stub() };
        const sut           = new ScrapingService(keyValueStore as any, httpClient as any);
        const $             = (x) => $$(json(keyValueStore.save.getCalls()[0].args[1]).readings[0].text)(x);
        const data          = getFileContent("./test/assets/no_duplicates_are_allowed.html");

        keyValueStore.save
            .returns(Promise.resolve({} as PutObjectOutput));

        httpClient.get.withArgs(link)
            .returns({data});

        // Act
        const actual = await sut.scrapReadings([record as any]);

        // Assert
        expect([{}]).to.eql(actual);
        expect(4).to.eql($("span.text").length);
    });

    it("should take only right verses", async () => {
        // Arrange
        const $$            = cheerio.load;
        const json          = JSON.parse;
        const link          = alpha();
        const crawling      = {key: alpha(), readings: [{link}]};
        const record        = {Sns: {Message: str(crawling)}};
        const httpClient    = { get: sinon.stub() };
        const keyValueStore = { save: sinon.stub() };
        const sut           = new ScrapingService(keyValueStore as any, httpClient as any);
        const $             = (x) => $$(json(keyValueStore.save.getCalls()[0].args[1]).readings[0].text)(x);
        const data          = getFileContent("./test/assets/right_verses_original.html");

        keyValueStore.save
            .returns(Promise.resolve({} as PutObjectOutput));

        httpClient.get.withArgs(link)
            .returns({data});

        // Act
        const actual = await sut.scrapReadings([record as any]);

        // Assert
        expect([{}]).to.eql(actual);
        expect(2).to.eql($("span.text").length);
    });

    it("should not take foot notes when source text contains them", async () => {
        // Arrange
        const json          = JSON.parse;
        const link          = alpha();
        const crawling      = {key: alpha(), readings: [{link}]};
        const record        = {Sns: {Message: str(crawling)}};
        const httpClient    = { get: sinon.stub() };
        const keyValueStore = { save: sinon.stub() };
        const sut           = new ScrapingService(keyValueStore as any, httpClient as any);
        const first         = (): string => json(keyValueStore.save.getCalls()[0].args[1]).readings[0].text;
        const data          = getFileContent("./test/assets/no_foot_notes_original.html");

        keyValueStore.save
            .returns(Promise.resolve({} as PutObjectOutput));

        httpClient.get.withArgs(link)
            .returns({data});

        // Act
        const actual = await sut.scrapReadings([record as any]);

        // Assert
        expect([{}]).to.eql(actual);
        expect(false).to.eql(first()
            .includes("[<a href=\"#fen-NRSVCE-28862b\" title=\"See footnote b\">b</a>]"));
    });
});
