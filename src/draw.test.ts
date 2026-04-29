import { describe, expect, it } from "vitest";
import { chooseRandomWinners } from "./draw";

describe("chooseRandomWinners", () => {
  it("returns the requested number of winners when enough numbers are available", () => {
    const winners = chooseRandomWinners(1, 5, new Set(), 3, () => 0);

    expect(winners).toEqual([1, 2, 3]);
  });

  it("skips numbers that are already excluded", () => {
    const winners = chooseRandomWinners(1, 5, new Set([1, 2]), 2, () => 0);

    expect(winners).toEqual([3, 4]);
  });

  it("returns all available numbers when count is larger than the remaining pool", () => {
    const winners = chooseRandomWinners(1, 3, new Set([2]), 5, () => 0);

    expect(winners).toEqual([1, 3]);
  });

  it("returns an empty list when no numbers are available", () => {
    const winners = chooseRandomWinners(1, 2, new Set([1, 2]), 2, () => 0);

    expect(winners).toEqual([]);
  });
});
