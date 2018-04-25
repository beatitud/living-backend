import {Callback, Context} from "aws-lambda";
import * as AWS from "aws-sdk";
import {hasIn, curry} from "lodash";
import * as Q from "q";
import { KeyValueStore } from "./KeyValueStore";

AWS.config.setPromisesDependency(Q.Promise);

if (hasIn(process.env, "Apple_PubSub_Socket_Render") || hasIn(process.env, "HOMEDRIVE")) {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: "personal"});
}

export async function scrap(event: any, context: Context, cb: Callback) {
    const result = await new KeyValueStore().save("some", "some").catch(e => e);
    console.log(result);
}
