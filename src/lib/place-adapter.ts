import type { BusinessResult, SearchParams } from "@/types";

type PlaceRecord = Record<string, unknown>;

/**
 * Build Apify run input for the configured Google Maps Actor.
 *
 * @param actorId Slash or tilde Actor id.
 * @param params Search form values from this app.
 * @returns Actor input for johnvc, dinesh, or compass-style Maps scrapers.
 */
export function buildMapsActorInput(
  actorId: string,
  params: SearchParams
): Record<string, unknown> {
  const query = params.subCategory
    ? `${params.subCategory} ${params.typeOfBusiness}`
    : params.typeOfBusiness;
  const normalized = String(actorId).replace("~", "/");

  if (normalized.includes("google-business-scraper")) {
    return {
      businessType: query,
      location: params.location,
      maxResults: params.maxResults,
    };
  }

  if (normalized.includes("google-maps-places-api")) {
    return {
      searchTerms: [`${query} in ${params.location}`],
      location: params.location,
      maxResultsPerSearch: Math.max(20, Number(params.maxResults) || 20),
      language: "en",
    };
  }

  return {
    searchStringsArray: [query],
    locationQuery: params.location,
    maxCrawledPlacesPerSearch: params.maxResults,
    language: "en",
    deeperCityScrape: false,
    includeHistogram: false,
    includeOpeningHours: true,
    includePeopleAlsoSearch: false,
    exportPlaceUrls: false,
    additionalInfo: false,
    scrapeDirectories: false,
  };
}

/**
 * Keep BusinessResult field names when the Actor uses phoneNumber/rating.
 *
 * @param item One dataset row from the Actor run.
 * @returns Mapped place, or null for empty/notice rows.
 */
export function normalizePlaceItem(
  item: PlaceRecord | null | undefined
): BusinessResult | null {
  if (!item || typeof item !== "object" || item.free_tier_notice) {
    return null;
  }
  const rating =
    (item.totalScore as number | undefined) ??
    (item.rating as number | undefined);
  const reviewsCount =
    (item.reviewsCount as number | undefined) ??
    (item.ratingCount as number | undefined) ??
    (typeof item.reviews === "number" ? item.reviews : undefined);
  return {
    ...(item as BusinessResult),
    title: String(item.title || item.name || ""),
    phone: String(item.phone || item.phoneNumber || item.phoneUnformatted || ""),
    totalScore: rating,
    rating,
    reviewsCount,
    thumbnailUrl: String(item.thumbnailUrl || item.imageUrl || ""),
  };
}
