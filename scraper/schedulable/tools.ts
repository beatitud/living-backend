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

const getLinks = (baseUrl: string) => {

    const formatUrls = x => getDates().map(y => [x[0], `${x[1]}/${y}`, `${baseUrl}/${x[1]}/${y}/mass.htm`]);
    const mapToPath  =  curryRight(flatMap)(formatUrls);
    const chain = flow(getCountryCalendars, mapToPath);
    return chain();
};

console.log(getLinks("http://universalis.com"));
