import { fetchURLs } from "./cbic-urls";
import { Currency, parseRate } from "./pdf-parserr";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRatesForYearAndCurrency(year: number, currency: Currency) {
  const urls = await fetchURLs(year);
  const rates = [];

  for (let i = 0; i < urls.length; i++) {
    console.log(`Parsing ${i}, ${urls[i].url}`);
    const pdfUrl = urls[i].url;
    const results = await parseRate(pdfUrl, [currency]);
    await delay(200);
    const currencyResults = results[currency];
    if (currencyResults) {
      rates.push({ ...currencyResults, ...urls[i] });
    }
  }

  return rates;
}

fetchRatesForYearAndCurrency(2020, Currency.USD)
  .then(console.log)
  .catch(console.error);
