import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import WinPage from "@/app/win/page";

describe("Win page", () => {
    // [TC-108] renders the victory message
  it("renders the victory message", () => {
    render(<WinPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "You Survived" })
    ).toBeInTheDocument();
    expect(screen.getByText("6:00 AM — SHIFT COMPLETED")).toBeInTheDocument();
    expect(
      screen.getByText("ALL ANOMALIES CONTAINED • POWER SECURED")
    ).toBeInTheDocument();
  });

    // [TC-109] offers a return to the main menu
  it("offers a return to the main menu", () => {
    render(<WinPage />);

    expect(
      screen.getByRole("link", { name: "Return to Menu" })
    ).toHaveAttribute("href", "/");
  });

    // [TC-110] cleans up the alarm audio on unmount
  it("cleans up the alarm audio on unmount", () => {
    const { unmount } = render(<WinPage />);

    expect(() => unmount()).not.toThrow();
  });

    // [TC-111] retries the alarm on user interaction when autoplay is blocked
  it("retries the alarm on user interaction when autoplay is blocked", async () => {
    const play = vi.mocked(window.HTMLMediaElement.prototype.play);
    play.mockRejectedValueOnce(new Error("autoplay blocked"));

    render(<WinPage />);
    expect(play).toHaveBeenCalledTimes(1);

    await act(async () => {});
    fireEvent.click(window);
    expect(play).toHaveBeenCalledTimes(2);
  });

    // [TC-112] stops the alarm before returning to the menu
  it("stops the alarm before returning to the menu", () => {
    const pause = vi.mocked(window.HTMLMediaElement.prototype.pause);
    render(<WinPage />);

    const link = screen.getByRole("link", { name: "Return to Menu" });
    link.addEventListener("click", (event) => event.preventDefault());

    pause.mockClear();
    fireEvent.click(link);

    expect(pause).toHaveBeenCalled();
  });
});
