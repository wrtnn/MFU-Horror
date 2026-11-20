import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GhostRenderer } from "./GhostRenderer";
import { INITIAL_GHOSTS, type GhostState } from "@/systems/ghostSystem";
import { GAME_IMAGES } from "@/config/assets";

function makeGhost(overrides: Partial<GhostState> = {}): GhostState {
  return {
    ...INITIAL_GHOSTS.cam1,
    active: true,
    ...overrides,
  };
}

describe("GhostRenderer", () => {
  it("renders nothing when the ghost is inactive", () => {
    const { container } = render(
      <GhostRenderer ghost={makeGhost({ active: false })} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the anomaly sprite for the ghost's camera", () => {
    render(<GhostRenderer ghost={makeGhost({ camId: "cam3" })} />);

    const image = screen.getByAltText("Ghost on cam3");
    expect(image).toHaveAttribute("src", GAME_IMAGES.anomalies.cam3);
  });

  it("applies the ghost opacity to the wrapper", () => {
    const { container } = render(
      <GhostRenderer ghost={makeGhost({ opacity: 0.42 })} />
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: "0.42" });
  });

  it("does not apply a color filter before exposure", () => {
    const { container } = render(
      <GhostRenderer ghost={makeGhost({ exposureProgress: 0 })} />
    );

    const imageWrapper = container.firstElementChild
      ?.firstElementChild as HTMLElement;
    expect(imageWrapper.style.filter).toBe("none");
  });

  it("applies a reddening filter while being exposed", () => {
    const { container } = render(
      <GhostRenderer ghost={makeGhost({ exposureProgress: 0.5 })} />
    );

    const imageWrapper = container.firstElementChild
      ?.firstElementChild as HTMLElement;

    expect(imageWrapper.style.filter).toContain("sepia(50%)");
    expect(imageWrapper.style.filter).toContain("saturate(500%)");
    expect(imageWrapper.style.filter).toContain("hue-rotate(-25deg)");
  });

  it("clamps the exposure progress between 0 and 1", () => {
    const overExposed = render(
      <GhostRenderer ghost={makeGhost({ exposureProgress: 5 })} />
    );
    const overFilter = (overExposed.container.firstElementChild
      ?.firstElementChild as HTMLElement).style.filter;
    expect(overFilter).toContain("sepia(100%)");

    overExposed.unmount();

    const underExposed = render(
      <GhostRenderer ghost={makeGhost({ exposureProgress: -2 })} />
    );
    const underFilter = (underExposed.container.firstElementChild
      ?.firstElementChild as HTMLElement).style.filter;
    expect(underFilter).toBe("none");
  });
});
