import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TodayDate } from "@/components/TodayDate";

describe("TodayDate", () => {
  it("displays today's date in ISO format (YYYY-MM-DD)", () => {
    const today = new Date().toISOString().split("T")[0];

    render(<TodayDate />);

    expect(screen.getByTestId("today-date")).toHaveTextContent(today);
  });
});
