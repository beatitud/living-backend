import {times, values, flow, flatMap, curryRight} from "lodash";
import moment = require("moment");

const getCountryCalendars = () => Object.freeze([
    ["South America"                 , "americas"],
    ["South America - Brazil"        , "americas.brazil"],
    ["Asia"                          , "asia"],
    ["Asia - India"                  , "asia.india"],
    ["Asia - Singapore"              , "asia.singapore"],
    ["Asia - Philippines"            , "philippines"],
    ["Australia"                     , "australia"],
    ["New Zealand"                   , "nz"],
    ["North America - Canada"        , "canada"],
    ["North America - United States" , "usa"],
    ["Africa - Nigeria"              , "nigeria"],
    ["Africa - Southern Africa"      , "safrica"],
    ["Europe"                        , "europe"],
    ["Europe - Belarus"              , "europe.belarus"],
    ["Europe - England"              , "europe.england"],
    ["Europe - Ireland"              , "europe.ireland"],
    ["Europe - Italy"                , "europe.italy"],
    ["Europe - Malta"                , "europe.malta"],
    ["Europe - Netherlands"          , "europe.netherlands"],
    ["Europe - Poland"               , "europe.poland"],
    ["Europe - Scotland"             , "europe.scotland"],
    ["Europe - Sweden"               , "europe.sweden"],
    ["Europe - Wales"                , "europe.wales"],
    ["Eastern General"               , "east"],
    ["Middle East"                   , "meast"],
    ["Middle East - Southern Arabia" , "meast.sarabia"],
] as Array<[string, string]>);

const getDates = (max: number = 7) =>
    times(7, x => moment.utc().add(x, "days").format("YYYYMMDD"));

// http://universalis.com/americas.brazil/20180413/mass.htm

export interface IEndpoint {
    url: string;
    title: string;
    key: string;
}

export const getLinks = (baseUrl: string): IEndpoint[] => {
    const formatUrls: (x) => IEndpoint[] = x => getDates().map(y => ({
        title: x[0],
        key: `${x[1]}/${y}`,
        url: `${baseUrl}/${x[1]}/${y}/mass.htm`,
    }));
    const chain = flow(getCountryCalendars, x => flatMap(x, formatUrls));
    return chain();
};

// console.log(getLinks("http://universalis.com"));
