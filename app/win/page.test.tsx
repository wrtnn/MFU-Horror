import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import WinPage from "./page";

describe("Win page", () => {
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

  it("offers a return to the main menu", () => {
    render(<WinPage />);

    expect(
      screen.getByRole("link", { name: "Return to Menu" })
    ).toHaveAttribute("href", "/");
  });

  it("cleans up the alarm audio on unmount", () => {
    const { unmount } = render(<WinPage />);

    expect(() => unmount()).not.toThrow();
  });

  it("retries the alarm on user interaction when autoplay is blocked", async () => {
    const play = vi.mocked(window.HTMLMediaElement.prototype.play);
    play.mockRejectedValueOnce(new Error("autoplay blocked"));

    render(<WinPage />);
    expect(play).toHaveBeenCalledTimes(1);

    await act(async () => {});
    fireEvent.click(window);
    expect(play).toHaveBeenCalledTimes(2);
  });

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
