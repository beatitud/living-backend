import {times, values, flow, flatMap, curryRight} from "lodash";
import moment = require("moment");
import { url } from "inspector";

const getDates = (max: number = 30) =>
    times(max, x => moment.utc().add(x, "days").format("YYYY-M-DD"));

export interface IEndpoint {
    url: string;
    title?: string;
    key: string;
    data?: any;
}

export const getEwtnLinks = (): IEndpoint[] => {
    const baseUrl = "https://www.ewtn.com/se/readings/readingsservice.svc/day";
    return getDates().map(x => ({url: `${baseUrl}/${x}/en`, key: `readings/ewtn/${x}/data.json`}));
};
