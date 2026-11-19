/**
 * Centralized Asset Paths with Cache-Busting Tokens.
 * Whenever image assets are replaced or updated, bumping this build token
 * guarantees that browsers, Next.js Image Optimization service, and Vercel Edge CDN
 * treat the files as brand-new URLs and never serve stale cached images.
 */
export const ASSET_VERSION = "20261119-v2";

export function getAssetUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanPath}?v=${ASSET_VERSION}`;
}

export const GAME_IMAGES = {
  // CCTV camera feeds
  cctv: {
    cam1: getAssetUrl("/assets/images/cctv/cam1.jpg"),
    cam1Light: getAssetUrl("/assets/images/cctv/cam1Light.jpg"),
    cam2: getAssetUrl("/assets/images/cctv/cam2.jpg"),
    cam2Light: getAssetUrl("/assets/images/cctv/cam2Light.jpg"),
    cam3: getAssetUrl("/assets/images/cctv/cam3.jpg"),
    cam3Light: getAssetUrl("/assets/images/cctv/cam3Light.jpg"),
    cam4: getAssetUrl("/assets/images/cctv/cam4.jpg"),
    cam4Light: getAssetUrl("/assets/images/cctv/cam4Light.jpg"),
  },
  // Anomaly ghosts
  anomalies: {
    cam1: getAssetUrl("/assets/images/anomalies/ghostCam1.png"),
    cam2: getAssetUrl("/assets/images/anomalies/ghostCam2.png"),
    cam3: getAssetUrl("/assets/images/anomalies/ghostCam3.png"),
    cam4: getAssetUrl("/assets/images/anomalies/ghostCam4.png"),
  },
  // UI screens
  ui: {
    menu: getAssetUrl("/assets/images/ui/menu.jpg"),
    win: getAssetUrl("/assets/images/ui/win.jpg"),
    lose: getAssetUrl("/assets/images/ui/lose.jpg"),
  },
} as const;
