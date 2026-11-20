import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GhostRenderer } from "@/components/cctv/GhostRenderer";
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
    // [TC-080] renders nothing when the ghost is inactive
  it("renders nothing when the ghost is inactive", () => {
    const { container } = render(
      <GhostRenderer ghost={makeGhost({ active: false })} />
    );

    expect(container).toBeEmptyDOMElement();
  });

    // [TC-081] renders the anomaly sprite for the ghost's camera
  it("renders the anomaly sprite for the ghost's camera", () => {
    render(<GhostRenderer ghost={makeGhost({ camId: "cam3" })} />);

    const image = screen.getByAltText("Ghost on cam3");
    expect(image).toHaveAttribute("src", GAME_IMAGES.anomalies.cam3);
  });

    // [TC-082] applies the ghost opacity to the wrapper
  it("applies the ghost opacity to the wrapper", () => {
    const { container } = render(
      <GhostRenderer ghost={makeGhost({ opacity: 0.42 })} />
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: "0.42" });
  });

    // [TC-083] does not apply a color filter before exposure
  it("does not apply a color filter before exposure", () => {
    const { container } = render(
      <GhostRenderer ghost={makeGhost({ exposureProgress: 0 })} />
    );

    const imageWrapper = container.firstElementChild
      ?.firstElementChild as HTMLElement;
    expect(imageWrapper.style.filter).toBe("none");
  });

    // [TC-084] applies a reddening filter while being exposed
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

    // [TC-085] clamps the exposure progress between 0 and 1
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
