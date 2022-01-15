import axios from "axios";
import { parse } from "node-html-parser";
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
    // body: `year=${year}`,
  );

  // axios.post(authServerUrl + token_access_path,
  //   querystring.stringify({
  //           username: 'abcd', //gave the values directly for testing
  //           password: '1235!',
  //           client_id: 'user-client'
  //   }), {
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded"
  //     }
  //   }).then(function(response) {
  //       console.log(response);
  //   });

  return (await response.data) as string;
}

export async function fetchURLs(year: number) {
  const html = await getHTMLContent(year);
  const root = parse(html);
  const table = root.querySelector(".ui-table.id1");
  const tbody = table.querySelector("tbody");
  const rows = tbody.querySelectorAll("tr");
  const urls = rows
    .map((row) => {
      const cells = row.querySelectorAll("td");
      const label = cells[0].rawText;

      const date = label
        .split("[")[1]
        .split("]")[0]
        .replace("Effective from ", "");

      const ts = moment(date, "Do MMMM, YYYY").unix();

      const engCell = cells[1];
      const url = engCell.querySelector("a").attributes.href;
      if (url) {
        return { date, ts, url: `https://www.cbic.gov.in/resources/${url}` };
      }
      return null;
    })
    .filter((url) => !!url);
  return urls;
}
