import { firestore } from "./fire";

const ratesRef = firestore.collection("rates");

export async function getRate(ts: number) {
  const rates = await ratesRef.get();

  const rateDoc = await rates.query
    .where("ts", "<=", ts)
    .orderBy("ts", "desc")
    .limit(1)
    .get();

  return rateDoc.docs[0].data();
}

export function setRate() {}
