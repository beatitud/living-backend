import {times, values, flow, flatMap, curryRight} from "lodash";
import moment = require("moment");
import { url } from "inspector";

const DATE_FORMAT = "YYYY-M-DD";

const getDates = (max: number = 30) =>
    times(max, x => moment.utc().add(x, "days").format(DATE_FORMAT));

export interface IEndpoint {
    url: string;
    title?: string;
    key: string;
    data?: any;
}

export const getEwtnLinks = (): IEndpoint[] => {
    const baseUrl = "https://www.ewtn.com/se/readings/readingsservice.svc/day";
    return getDates().map(x => ({
        url: `${baseUrl}/${x}/en`,
        key: `readings/ewtn/${moment(x, DATE_FORMAT).format("YYYY/MM/DD")}/data.json`,
    }));
};
