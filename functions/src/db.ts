import moment from "moment";
import { firestore } from "./fire";
import {
  Result,
  processUrlsForCurrency,
  fetchURLs,
  Currency,
} from "./cbic-api";

const ratesRef = firestore.collection("rates");

type CacheType = {
  items: Result[];
  lastSync: number;
};

function findRate(data: CacheType, ts: number) {
  const result = data.items.find((r) => r.ts <= ts);
  if (!result) return null;
  if (data.lastSync < ts) return null;
  return result;
}

async function getApiDataForYear(year: number) {
  const lastSync = moment().unix();
  const urls = await fetchURLs(year);
  const records = await processUrlsForCurrency(urls, Currency.USD);
  return { items: records, lastSync };
}

async function getDbDataForYear(year: number) {
  const yearObj = await ratesRef.doc(year.toString()).get();
  return yearObj.exists ? (yearObj.data() as CacheType) : null;
}

function setDbDataForYear(year: number, data: CacheType) {
  return ratesRef.doc(year.toString()).set(data);
}

async function getData(year: number) {
  let data = await getDbDataForYear(year);
  if (data) return data;
  data = await getApiDataForYear(year);
  await setDbDataForYear(year, data);
  return data;
}

export async function getRate(ts: number) {
  const now = moment().unix();
  if (ts > now) {
    throw new Error("Requested timestamp is in the future");
  }

  const momentTs = moment.unix(ts);
  const currentYear = moment().year();
  const year = momentTs.year();

  let data = await getData(year);

  // Update data for current year if needed
  if (
    year === currentYear && // fetching for current year
    ts > data.items[0].ts && // ts is after the latest item
    ts > data.lastSync // sync is older than ts, new data might be available
  ) {
    const urls = await fetchURLs(year);

    if (urls[0].ts > data.items[0].ts) {
      // some new PDF has been added
      data = await getApiDataForYear(year);
    }
  }

  const rate = findRate(data, ts);
  if (rate) return rate;

  const lastYearTs = momentTs
    .clone()
    .year(year - 1)
    .unix();
  if (ts < data.items[data.items.length - 1].ts && ts > lastYearTs) {
    // record for given date is in last year
    const newYear = year - 1;
    const lastYearData = await getData(newYear);
    const rate = findRate(lastYearData, ts);
    if (rate) return rate;
  }

  throw new Error("No data found");
}
