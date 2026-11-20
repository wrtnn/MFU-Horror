import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BatteryIndicator } from "./BatteryIndicator";

function getSegments(container: HTMLElement) {
  return Array.from(container.querySelectorAll("div.flex-1"));
}

function activeSegmentCount(container: HTMLElement) {
  return getSegments(container).filter(
    (segment) =>
      segment.className.includes("bg-emerald-400") ||
      segment.className.includes("bg-amber-400")
  ).length;
}

describe("BatteryIndicator", () => {
  it("renders the label and rounds the percentage up", () => {
    render(<BatteryIndicator battery={25.1} />);

    expect(screen.getByText("BATTERY")).toBeInTheDocument();
    expect(screen.getByText("26%")).toBeInTheDocument();
  });

  it("shows all four segments when the battery is full", () => {
    const { container } = render(<BatteryIndicator battery={100} />);

    expect(activeSegmentCount(container)).toBe(4);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it.each([
    [100, 4],
    [76, 4],
    [75, 3],
    [51, 3],
    [50, 2],
    [26, 2],
    [25, 1],
    [1, 1],
    [0, 0],
  ])("battery %i%% shows %i active segments", (battery, expected) => {
    const { container } = render(<BatteryIndicator battery={battery} />);

    expect(activeSegmentCount(container)).toBe(expected);
  });

  it("uses the critical styling between 1% and 25%", () => {
    const { container } = render(<BatteryIndicator battery={25} />);

    expect(screen.getByText("25%")).toHaveClass("text-amber-400");
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(container.querySelector(".bg-amber-500")).toBeInTheDocument();
  });

  it("uses the dead styling at 0%", () => {
    const { container } = render(<BatteryIndicator battery={0} />);

    expect(screen.getByText("0%")).toHaveClass("text-red-500");
    expect(container.querySelector(".animate-ping")).toBeInTheDocument();
    expect(container.querySelector(".border-red-600")).toBeInTheDocument();
  });

  it("uses the healthy styling above 25%", () => {
    const { container } = render(<BatteryIndicator battery={80} />);

    expect(screen.getByText("80%")).toHaveClass("text-zinc-400");
    expect(container.querySelector(".bg-emerald-500")).toBeInTheDocument();
  });
});
