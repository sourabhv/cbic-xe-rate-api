import axios from "axios";
import cheerio from "cheerio";
import moment from "moment";

async function getHTMLContent(year: number) {
  const response = await axios.post(
    "https://www.cbic.gov.in/Exchange-Rate-Notifications",
    `year=${year}`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data as string;
}

export type URLType = {
  date: string;
  ts: number;
  url: string;
};

export async function fetchURLs(year: number): Promise<URLType[]> {
  const html = await getHTMLContent(year);
  const $ = cheerio.load(html);
  const rows = $(".ui-table.id1 tbody tr").toArray();
  if (rows.length === 0) {
    throw new Error("No urls found");
  }
  return rows.map((row) => {
    const cells = $(row).find("td").toArray();
    const label = $(cells[0]).html();
    if (!label) {
      throw new Error("Label format exception");
    }

    const date = label
      .split("[")[1]
      .split("]")[0]
      .replace("Effective from ", "");

    const ts = moment(date, "Do MMMM, YYYY").unix();

    const engPdfCell = cells[1];
    const url = $(engPdfCell).find("a").toArray()?.[0]?.attribs?.href;
    if (!url) {
      throw new Error("Url format exception");
    }

    return { date, ts, url: `https://www.cbic.gov.in/resources/${url}` };
  });
}
