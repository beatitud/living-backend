import {Callback, Context} from "aws-lambda";
import * as AWS from "aws-sdk";
import { hasIn, countBy, isNil } from "lodash";
import * as Q from "q";
import { KeyValueStore } from "./KeyValueStore";
import { ReadingsService } from "./ReadingsService";

AWS.config.setPromisesDependency(Q.Promise);

if (hasIn(process.env, "Apple_PubSub_Socket_Render") || hasIn(process.env, "HOMEDRIVE")) {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: "personal"});
}

export async function scrap(event: any, context: Context, cb: Callback) {
    const readingsService = new ReadingsService();
    const result = await readingsService.prepareReadings();
    console.log("Count of unsaved records(days): ", countBy(result, isNil).true);
    console.log("Saved result: ", result.filter(x => !isNil(x)));
}
