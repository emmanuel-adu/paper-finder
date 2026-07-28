import { describe, expect, it } from "vitest";
import { simplifyQuery } from "./simplifyQuery";

describe("simplifyQuery", () => {
  it("strips common stopwords, keeping content words", () => {
    expect(
      simplifyQuery(
        "a model that uses only attention mechanisms without recurrence for sequence transduction",
      ),
    ).toBe(
      "model attention mechanisms without recurrence sequence transduction",
    );
  });

  it("leaves a short technical query essentially unchanged", () => {
    expect(simplifyQuery("Vertical Federated Learning")).toBe(
      "Vertical Federated Learning",
    );
  });

  it("falls back to the original query if everything would be stripped", () => {
    expect(simplifyQuery("the is a of")).toBe("the is a of");
  });

  it("is case-insensitive when matching stopwords but preserves original casing", () => {
    expect(simplifyQuery("The Attention Mechanism")).toBe(
      "Attention Mechanism",
    );
  });
});
