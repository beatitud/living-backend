import {APIGatewayEvent, Callback, Context, Handler} from "aws-lambda";


export const scrap: Handler = async (event: any, context: Context, cb: Callback) => {
    console.log("Done");
};
