import { vi } from "vitest";

export const pushMock = vi.fn();
export const replaceMock = vi.fn();
export const backMock = vi.fn();
export const forwardMock = vi.fn();
export const refreshMock = vi.fn();
export const prefetchMock = vi.fn();

let currentPathname = "/";

export function setPathname(pathname: string) {
  currentPathname = pathname;
}

export function resetNavigation() {
  currentPathname = "/";
  pushMock.mockReset();
  replaceMock.mockReset();
  backMock.mockReset();
  forwardMock.mockReset();
  refreshMock.mockReset();
  prefetchMock.mockReset();
}

export function useRouter() {
  return {
    push: pushMock,
    replace: replaceMock,
    back: backMock,
    forward: forwardMock,
    refresh: refreshMock,
    prefetch: prefetchMock,
  };
}

export function usePathname() {
  return currentPathname;
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams() {
  return {};
}
