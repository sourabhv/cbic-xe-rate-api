import express from "express";
import moment from "moment";

import { getRate } from "./db";

const app = express();

app.get("/ts/:ts", async (req, res) => {
  const ts = Number.parseInt(req.params.ts);
  try {
    const rate = await getRate(ts);
    return res.status(200).json(rate);
  } catch (err) {
    return res
      .status(404)
      .json({ message: "Not found", error: (err as Error).message });
  }
});

app.get("/date/:date", async (req, res) => {
  const date = req.params.date;
  const ts = moment(date, "DD-MM-YYYY").unix();

  try {
    const rate = await getRate(ts);
    return res.status(200).json(rate);
  } catch (err) {
    return res
      .status(404)
      .json({ message: "Not found", error: (err as Error).message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
