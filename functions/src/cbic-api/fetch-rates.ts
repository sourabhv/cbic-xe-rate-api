import { fetchURLs } from "./cbic-urls";
import { Currency, parseRate } from "./pdf-parser";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type Result = {
  date: string;
  ts: number;
  url: string;
  iRate: number;
  eRate: number;
};

export async function fetchRatesForYearAndCurrency(
  year: number,
  currency: Currency
): Promise<Result[]> {
  const urls = await fetchURLs(year);
  const rates = [];

  for (let i = 0; i < urls.length; i++) {
    console.log(`Parsing ${i}, ${urls[i].url}`);
    const pdfUrl = urls[i].url;
    let results;
    try {
      results = await parseRate(pdfUrl, [currency]);
    } catch (err) {
      console.error(`Error fetching ${pdfUrl}`);
      await delay(5000);
      results = await parseRate(pdfUrl, [currency]);
    }

    await delay(200);

    const currencyResults = results[currency];
    if (currencyResults) {
      rates.push({ ...currencyResults, ...urls[i] });
    }
  }

  return rates;
}
