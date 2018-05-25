import {Callback, Context, SNSEvent} from "aws-lambda";
import * as AWS from "aws-sdk";
import { hasIn, countBy, isNil } from "lodash";
import * as Q from "q";
import { ReadingsService } from "./ReadingsService";
import * as console from "console";
import ScrapingService, {IScrapingService} from "./ScrapingService";

AWS.config.setPromisesDependency(Q.Promise);

if (hasIn(process.env, "Apple_PubSub_Socket_Render") || hasIn(process.env, "HOMEDRIVE")) {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: "personal"});
}

export async function crawlReferences(event: any, context: Context, cb: Callback) {
    const readingsService = new ReadingsService();
    const references = await readingsService.prepareReferences();
    // console.log("Count of unsaved records(days): ", countBy(references, isNil).true);
    console.log("Saved references: ", JSON.stringify(references.filter(x => !isNil(x))));
    const result = await readingsService.propagateReferences(references);
    console.log("Result: ", JSON.stringify(result));
}

export async function scrapReadings(event: SNSEvent) {
    const scrapingService = new ScrapingService() as IScrapingService;
    const result = await scrapingService.scrapReadings(event.Records);
    console.log(JSON.stringify(result));
    return result;
}
