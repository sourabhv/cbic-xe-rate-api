import * as functions from "firebase-functions";
import { getRate } from "./db";

import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/ts", async (req, res) => {
  const ts = Number.parseInt(req.body.ts);
  const rate = await getRate(ts);

  if (!rate) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.status(200).json(rate);
});

app.get("/date", (req, res) => {});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export const rate = functions.https.onRequest(app);
