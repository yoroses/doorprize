import { describe, expect, it } from "vitest";
import { chooseRandomItems, normalizeImportedParticipants } from "./participants";

describe("normalizeImportedParticipants", () => {
  it("maps known Excel columns into participant records", () => {
    const participants = normalizeImportedParticipants([
      {
        "Employee ID": "000325183",
        "Employee Name": "Abdul Patah Nurman",
        Dinas: "Dinas Sore",
        "Work Location": "Cikarang Liquid Factory",
      },
    ]);

    expect(participants).toEqual([
      {
        employeeId: "000325183",
        employeeName: "Abdul Patah Nurman",
        dinas: "Dinas Sore",
        workLocation: "Cikarang Liquid Factory",
      },
    ]);
  });

  it("drops rows that do not have employee id and name", () => {
    const participants = normalizeImportedParticipants([
      {
        "Employee ID": "",
        "Employee Name": "Only Name",
      },
      {
        "Employee ID": "0001",
        "Employee Name": "",
      },
    ]);

    expect(participants).toEqual([]);
  });
});

describe("chooseRandomItems", () => {
  it("returns the requested number of unique participants", () => {
    const participants = [
      { employeeId: "1", employeeName: "A", dinas: "", workLocation: "" },
      { employeeId: "2", employeeName: "B", dinas: "", workLocation: "" },
      { employeeId: "3", employeeName: "C", dinas: "", workLocation: "" },
    ];

    const winners = chooseRandomItems(participants, new Set(), 2, () => 0);

    expect(winners.map((item) => item.employeeId)).toEqual(["1", "2"]);
  });

  it("skips excluded participants", () => {
    const participants = [
      { employeeId: "1", employeeName: "A", dinas: "", workLocation: "" },
      { employeeId: "2", employeeName: "B", dinas: "", workLocation: "" },
      { employeeId: "3", employeeName: "C", dinas: "", workLocation: "" },
    ];

    const winners = chooseRandomItems(
      participants,
      new Set(["1", "2"]),
      2,
      () => 0
    );

    expect(winners.map((item) => item.employeeId)).toEqual(["3"]);
  });
});
