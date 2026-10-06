// Writes backend/config/catalog.json from src/data/products.js so the PHP API can price orders itself.
// Runs automatically before `npm run dev`; run `npm run catalog` after editing products.js.
import { writeFileSync } from "node:fs";
import products from "../src/data/products.js";

const ids = new Set();
for (const p of products) {
  if (!Number.isInteger(p.id) || ids.has(p.id)) throw new Error(`Duplicate or invalid product id: ${p.id}`);
  if (!(p.price > 0) || !(p.discount >= 0 && p.discount <= 100) || !(p.stock >= 0)) throw new Error(`Bad price/discount/stock on product ${p.id}`);
  ids.add(p.id);
}

writeFileSync(new URL("../../backend/config/catalog.json", import.meta.url), JSON.stringify(Object.fromEntries(products.map((p) => [p.id, p]))));
console.log(`catalog.json written: ${products.length} products`);
