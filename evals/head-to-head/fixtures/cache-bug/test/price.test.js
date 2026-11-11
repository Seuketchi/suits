import test from "node:test";
import assert from "node:assert/strict";
import { priceFor } from "../src/price.js";

test("USD price", () => assert.equal(priceFor("A1", "USD", "ph", 10), 10));
test("PHP price after a USD lookup", () => assert.equal(priceFor("A1", "PHP", "ph", 10), 560));
