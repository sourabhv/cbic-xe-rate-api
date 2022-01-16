import moment from "moment";
import { firestore } from "./fire";
import { Result, fetchRatesForYearAndCurrency, Currency } from "./cbic-api";

const ratesRef = firestore.collection("rates");

type CacheType = {
  items: Result[];
  lastSync: number;
};

function findRate(data: CacheType, ts: number) {
  const result = data.items.find((r) => r.ts <= ts);

  if (!result) return null;

  if (data.lastSync >= ts) return result;

  return null;
}

export async function getRate(ts: number) {
  const year = moment.unix(ts).year();

  const yearObj = await ratesRef.doc(year.toString()).get();

  if (!yearObj.exists) {
    return await updateAndGetRate(ts);
  }

  const data = yearObj.data() as CacheType;
  const rate = findRate(data, ts);

  if (rate) {
    return rate;
  }
  return await updateAndGetRate(ts);
}

async function updateAndGetRate(ts: number) {
  const year = moment.unix(ts).year();
  const syncTs = moment().unix();

  const records = await fetchRatesForYearAndCurrency(year, Currency.USD);

  const data: CacheType = {
    items: records,
    lastSync: syncTs,
  };

  await ratesRef.doc(year.toString()).set(data);
  return findRate(data, ts);
}
