import * as functions from "firebase-functions";
import rateApi from "./rate-api";

export const rate = functions
  .runWith({ timeoutSeconds: 500 })
  .https.onRequest(rateApi);
