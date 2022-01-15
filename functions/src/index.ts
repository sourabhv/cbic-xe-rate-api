import * as functions from "firebase-functions";
import { getRate } from "./db";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
export const rate = functions.https.onRequest(async (request, response) => {
  // functions.logger.info("Hello logs!", { structuredData: true });

  const ts = Number.parseInt(request.query.ts as string);
  const rate = await getRate(ts);

  if (!rate) {
    // fetch rate from CBIC for given year
    // write rates in db
  } else {
    response.send(rate);
  }
});
