import { describe, expect, it } from "vitest";
import { ASSET_VERSION, GAME_IMAGES, getAssetUrl } from "./assets";

describe("getAssetUrl", () => {
  it("keeps absolute paths and appends the cache-busting version", () => {
    expect(getAssetUrl("/assets/images/ui/menu.jpg")).toBe(
      `/assets/images/ui/menu.jpg?v=${ASSET_VERSION}`
    );
  });

  it("adds a leading slash to relative paths", () => {
    expect(getAssetUrl("assets/images/ui/menu.jpg")).toBe(
      `/assets/images/ui/menu.jpg?v=${ASSET_VERSION}`
    );
  });

  it("uses the current asset version token", () => {
    expect(ASSET_VERSION).toBe("20261119-v2");
  });
});

describe("GAME_IMAGES", () => {
  it("exposes all four CCTV base and illuminated feeds", () => {
    expect(Object.keys(GAME_IMAGES.cctv).sort()).toEqual([
      "cam1",
      "cam1Light",
      "cam2",
      "cam2Light",
      "cam3",
      "cam3Light",
      "cam4",
      "cam4Light",
    ]);
  });

  it("exposes one anomaly sprite per camera", () => {
    expect(GAME_IMAGES.anomalies).toEqual({
      cam1: `/assets/images/anomalies/ghostCam1.png?v=${ASSET_VERSION}`,
      cam2: `/assets/images/anomalies/ghostCam2.png?v=${ASSET_VERSION}`,
      cam3: `/assets/images/anomalies/ghostCam3.png?v=${ASSET_VERSION}`,
      cam4: `/assets/images/anomalies/ghostCam4.png?v=${ASSET_VERSION}`,
    });
  });

  it("exposes the menu, win, and lose screens", () => {
    expect(GAME_IMAGES.ui).toEqual({
      menu: `/assets/images/ui/menu.jpg?v=${ASSET_VERSION}`,
      win: `/assets/images/ui/win.jpg?v=${ASSET_VERSION}`,
      lose: `/assets/images/ui/lose.jpg?v=${ASSET_VERSION}`,
    });
  });
});
