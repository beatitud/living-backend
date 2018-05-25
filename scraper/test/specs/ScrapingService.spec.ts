import { expect } from "chai";
import {random} from "faker";
import sinon = require("sinon");
import ScrapingService from "../../src/ScrapingService";
import {PutObjectOutput} from "aws-sdk/clients/s3";
import * as cheerio from "cheerio";

describe("Scraping service component specs", async () => {

    const str = JSON.stringify;
    const alpha = () => random.alphaNumeric(1024);

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
        const data          = "<div class=\"version-ERV-RU result-text-style-normal text-html \">" +
            "<h1 class=\"passage-display\"><span class=\"passage-display-bcv\">От Марка 10:1-12</span>" +
            "<span class=\"passage-display-version\">Russian New Testament: Easy-to-Read Version (ERV-RU)" +
            "</span></h1> <h3><span id=\"ru-ERV-RU-1445\" class=\"text Mark-10-1\">Учение Иисуса о разводе" +
            "<sup class=\"crossreference\" data-link=\"(<a href=&quot;#cru-ERV-RU-1445A&quot; " +
            "title=&quot;See cross-reference A&quot;>A</a>)\" data-cr=\"#cru-ERV-RU-1445A\"></sup></span>" +
            "</h3><p class=\"chapter-2\"><span class=\"text Mark-10-1\"><span class=\"chapternum\">10&nbsp;" +
            "</span>Иисус покинул то место и отправился в Иудею и за Иордан. И вновь толпы народа стекались к " +
            "Нему и, по своему обычаю, Он учил их.</span></p><p><span id=\"ru-ERV-RU-1446\" class=\"text Mark-10-2\">" +
            "<sup class=\"versenum\">2&nbsp;</sup>Несколько фарисеев подошли к Нему и спросили, искушая Его: «По " +
            "Закону ли мужу разводиться с женой?»</span></p><div class=\"crossrefs hidden\">" +
            "<h4>Cross references:</h4>" +
            "<ol><li id=\"cru-ERV-RU-1445A\"><a href=\"#ru-ERV-RU-1445\" title=\"Go to От Марка 10:1\">" +
            "От Марка 10:1</a>" +
            " : <a class=\"crossref-link\" href=\"/passage/?search=%D0%9E%D1%82+%D0%9C%D0%B0%D1%82%D1%84%D0%B5%D" +
            "1%8F+19%3A1-%D0%9E%D1%82+%D0%9C%D0%B0%D1%82%D1%84%D0%B5%D1%8F+19%3A12&amp;version=ERV-RU\" " +
            "data-bibleref=\"От Матфея 19:1-От Матфея 19:12\">Мф. 19:1-12</a></li></ol></div></div>";

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
        const data          = "<p class='text'><span id='en-NRSVCE-28862' " +
        "class=\"text Mark-10-7\">" +
        "<sup class=\"versenum\">7&nbsp;</sup>‘For this reason a man " +
        "shall leave his father and mother and be joined to his " +
        "wife,<sup class=\"footnote\">" +
        "[<a href=\"#fen-NRSVCE-28862b\" title=\"See footnote b\">b</a>]" +
        "</sup></span></p>";

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
