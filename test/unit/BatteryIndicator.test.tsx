import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BatteryIndicator } from "@/components/game/BatteryIndicator";

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
    // [TC-059] renders the label and rounds the percentage up
  it("renders the label and rounds the percentage up", () => {
    render(<BatteryIndicator battery={25.1} />);

    expect(screen.getByText("BATTERY")).toBeInTheDocument();
    expect(screen.getByText("26%")).toBeInTheDocument();
  });

    // [TC-060] shows all four segments when the battery is full
  it("shows all four segments when the battery is full", () => {
    const { container } = render(<BatteryIndicator battery={100} />);

    expect(activeSegmentCount(container)).toBe(4);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

    // [TC-061] battery 100% shows 4 active segments
  it("battery 100% shows 4 active segments", () => {
    const { container } = render(<BatteryIndicator battery={100} />);
    expect(activeSegmentCount(container)).toBe(4);
  });

  // [TC-062] battery 76% shows 4 active segments
  it("battery 76% shows 4 active segments", () => {
    const { container } = render(<BatteryIndicator battery={76} />);
    expect(activeSegmentCount(container)).toBe(4);
  });

  // [TC-063] battery 75% shows 3 active segments
  it("battery 75% shows 3 active segments", () => {
    const { container } = render(<BatteryIndicator battery={75} />);
    expect(activeSegmentCount(container)).toBe(3);
  });

  // [TC-064] battery 51% shows 3 active segments
  it("battery 51% shows 3 active segments", () => {
    const { container } = render(<BatteryIndicator battery={51} />);
    expect(activeSegmentCount(container)).toBe(3);
  });

  // [TC-065] battery 50% shows 2 active segments
  it("battery 50% shows 2 active segments", () => {
    const { container } = render(<BatteryIndicator battery={50} />);
    expect(activeSegmentCount(container)).toBe(2);
  });

  // [TC-066] battery 26% shows 2 active segments
  it("battery 26% shows 2 active segments", () => {
    const { container } = render(<BatteryIndicator battery={26} />);
    expect(activeSegmentCount(container)).toBe(2);
  });

  // [TC-067] battery 25% shows 1 active segment
  it("battery 25% shows 1 active segment", () => {
    const { container } = render(<BatteryIndicator battery={25} />);
    expect(activeSegmentCount(container)).toBe(1);
  });

  // [TC-068] battery 1% shows 1 active segment
  it("battery 1% shows 1 active segment", () => {
    const { container } = render(<BatteryIndicator battery={1} />);
    expect(activeSegmentCount(container)).toBe(1);
  });

  // [TC-069] battery 0% shows 0 active segments
  it("battery 0% shows 0 active segments", () => {
    const { container } = render(<BatteryIndicator battery={0} />);
    expect(activeSegmentCount(container)).toBe(0);
  });

  // [TC-070] uses the critical styling between 1% and 25%
  it("uses the critical styling between 1% and 25%", () => {
    const { container } = render(<BatteryIndicator battery={25} />);

    expect(screen.getByText("25%")).toHaveClass("text-amber-400");
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(container.querySelector(".bg-amber-500")).toBeInTheDocument();
  });

    // [TC-071] uses the dead styling at 0%
  it("uses the dead styling at 0%", () => {
    const { container } = render(<BatteryIndicator battery={0} />);

    expect(screen.getByText("0%")).toHaveClass("text-red-500");
    expect(container.querySelector(".animate-ping")).toBeInTheDocument();
    expect(container.querySelector(".border-red-600")).toBeInTheDocument();
  });

    // [TC-072] uses the healthy styling above 25%
  it("uses the healthy styling above 25%", () => {
    const { container } = render(<BatteryIndicator battery={80} />);

    expect(screen.getByText("80%")).toHaveClass("text-zinc-400");
    expect(container.querySelector(".bg-emerald-500")).toBeInTheDocument();
  });
});
