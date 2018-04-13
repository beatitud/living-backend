import {Callback, Context} from "aws-lambda";
import * as AWS from "aws-sdk";
import {hasIn, curry} from "lodash";
import * as Q from "q";

AWS.config.setPromisesDependency(Q.Promise);

if (hasIn(process.env, "Apple_PubSub_Socket_Render") || hasIn(process.env, "HOMEDRIVE")) {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: "personal"});
}

export const rawScrap = curry(async (event: any, context: Context, cb: Callback) => {
    console.log("Done");
});

export async function scrap(event: any, context: Context, cb: Callback) {
    return await rawScrap(event)(context)(cb);
}
