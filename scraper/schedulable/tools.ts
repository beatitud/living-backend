import {times} from "lodash";
import moment = require("moment");

const DATE_FORMAT = "YYYY-M-D";

const getDates = (max: number = 30) =>
    times(max, x => moment.utc().add(x, "days").format(DATE_FORMAT));

export interface IEndpoint {
    url: string;
    title?: string;
    key: string;
    data?: any;
}

export const getReferencesLinks = (): IEndpoint[] => {
    const baseUrl = "https://www.ewtn.com/se/readings/readingsservice.svc/day";
    return getDates().map(x => ({
        url: `${baseUrl}/${x}/en`,
        key: `readings/scraped/${moment(x, DATE_FORMAT).format("YYYY/MM/DD")}/data.json`,
    }));
};
