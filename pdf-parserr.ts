import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import { TextItem } from "pdfjs-dist/types/src/display/api";

export enum Currency {
  AUD = "AUD",
  BHD = "BHD",
  CAD = "CAD",
  CNY = "CNY",
  DKK = "DKK",
  EUR = "EUR",
  HKD = "HKD",
  KWD = "KWD",
  NZD = "NZD",
  NOK = "NOK",
  GBP = "GBP",
  QAR = "QAR",
  SAR = "SAR",
  SGD = "SGD",
  ZAR = "ZAR",
  SEK = "SEK",
  CHF = "CHF",
  TRY = "TRY",
  AED = "AED",
  USD = "USD",
}

const currenciesNames: Record<Currency, string> = {
  [Currency.AUD]: "Australian Dollar",
  [Currency.BHD]: "Bahraini Dinar",
  [Currency.CAD]: "Canadian Dollar",
  [Currency.CNY]: "Chinese Yuan",
  [Currency.DKK]: "Danish Kroner",
  [Currency.EUR]: "EURO",
  [Currency.HKD]: "Hong Kong Dollar",
  [Currency.KWD]: "Kuwaiti Dinar",
  [Currency.NZD]: "New Zealand Dollar",
  [Currency.NOK]: "Norwegian Kroner",
  [Currency.GBP]: "Pound Sterling",
  [Currency.QAR]: "Qatari Riyal",
  [Currency.SAR]: "Saudi Arabian Riyal",
  [Currency.SGD]: "Singapore Dollar",
  [Currency.ZAR]: "South African Rand",
  [Currency.SEK]: "Swedish Kroner",
  [Currency.CHF]: "Swiss Franc",
  [Currency.TRY]: "Turkish Lira",
  [Currency.AED]: "UAE Dirham",
  [Currency.USD]: "US Dollar",
};

type RateResults = Partial<
  Record<
    Currency,
    {
      iRate: number;
      eRate: number;
    }
  >
>;

export async function parseRate(
  pdfUrl: string,
  currencies: Currency[]
): Promise<RateResults> {
  console.log(`Fetching ${pdfUrl}`);
  const pdf = await pdfjs.getDocument({
    url: pdfUrl,
    verbosity: 0,
  }).promise;
  const { numPages } = pdf._pdfInfo;

  const pages = await Promise.all(
    Array.from({ length: numPages }, (_, i) => pdf.getPage(i + 1))
  );

  const results: RateResults = {};

  for (let i = 0; i < currencies.length; i++) {
    const currency = currencies[i];
    for (let j = 0; j < numPages; j++) {
      const textContent = await pages[j].getTextContent();
      const textItems = textContent.items.filter((item) => {
        const textItem = item as TextItem;
        return !!textItem.str;
      }) as TextItem[];

      const text = textItems.map((item: TextItem) => item.str).join("");
      const currencyName = currenciesNames[currency];
      const regex = new RegExp(
        `${currencyName}\\s*(\\d+\\.\\d{1,2})\\s*(\\d+\\.\\d{1,2})`
      );
      const match = regex.exec(text);
      if (match) {
        const importRate = match[1];
        const exportRate = match[2];
        results[currency] = {
          iRate: Number.parseFloat(importRate),
          eRate: Number.parseFloat(exportRate),
        };
      }
    }
  }

  return results;
}
