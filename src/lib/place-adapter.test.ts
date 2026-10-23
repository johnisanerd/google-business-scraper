import assert from "node:assert/strict";
import test from "node:test";
import { buildMapsActorInput, normalizePlaceItem } from "./place-adapter.ts";

test("live maps Actor uses searchTerms and a 20-place floor", () => {
  const input = buildMapsActorInput("johnvc/google-maps-places-api", {
    typeOfBusiness: "coffee",
    location: "Austin TX",
    maxResults: 5,
  });
  assert.deepEqual(input.searchTerms, ["coffee in Austin TX"]);
  assert.equal(input.maxResultsPerSearch, 20);
  assert.equal(input.location, "Austin TX");
});

test("normalizePlaceItem maps phoneNumber and rating onto repo fields", () => {
  const item = normalizePlaceItem({
    title: "Cafe",
    phoneNumber: "512-555-0100",
    rating: 4.6,
    ratingCount: 120,
    website: "https://example.com",
  });
  assert.equal(item?.phone, "512-555-0100");
  assert.equal(item?.totalScore, 4.6);
  assert.equal(item?.rating, 4.6);
  assert.equal(item?.reviewsCount, 120);
  assert.equal(item?.title, "Cafe");
});

test("normalizePlaceItem drops free-tier notice rows", () => {
  assert.equal(
    normalizePlaceItem({ free_tier_notice: true, message: "upgrade" }),
    null
  );
});
