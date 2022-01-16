import { URLType } from ".";
import { Currency, parseRate } from "./pdf-parser";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type Result = {
  date: string;
  ts: number;
  url: string;
  iRate: number;
  eRate: number;
};

export async function processUrlsForCurrency(
  urls: URLType[],
  currency: Currency
): Promise<Result[]> {
  const rates: Result[] = [];
  for (let i = 0; i < urls.length; i++) {
    console.log(`Parsing PDF ${i + 1}/${urls.length}`);
    const pdfUrl = urls[i].url;
    let results;
    try {
      results = await parseRate(pdfUrl, [currency]);
    } catch (err) {
      console.error(`Error fetching ${pdfUrl}, retrying...`);
      await delay(5000);
      results = await parseRate(pdfUrl, [currency]);
    }

    await delay(250);

    const currencyResults = results[currency];
    if (currencyResults) {
      rates.push({ ...currencyResults, ...urls[i] });
    }
  }

  return rates;
}
