import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page", () => {
    // [TC-091] renders the title and primary actions
  it("renders the title and primary actions", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Anomaly Detection" })
    ).toBeInTheDocument();
    expect(screen.getByText("MFU CCTV Survival Horror")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start/i })).toHaveAttribute(
      "href",
      "/game"
    );
    expect(
      screen.getByText("SURVIVE 12:00 AM – 6:00 AM • 4 CAMERAS")
    ).toBeInTheDocument();
  });

    // [TC-092] marks audio as playing when the menu track autoplays
  it("marks audio as playing when the menu track autoplays", async () => {
    render(<Home />);

    expect(
      await screen.findByRole("button", { name: "Toggle Menu Audio" })
    ).toHaveTextContent("AUDIO: PLAYING");
  });

    // [TC-093] toggles the menu audio on and off
  it("toggles the menu audio on and off", async () => {
    render(<Home />);

    const toggle = await screen.findByRole("button", {
      name: "Toggle Menu Audio",
    });
    await waitFor(() => expect(toggle).toHaveTextContent("AUDIO: PLAYING"));

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("AUDIO: MUTED (CLICK)");

    fireEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveTextContent("AUDIO: PLAYING"));
  });

    // [TC-094] stops the menu audio when starting the game
  it("stops the menu audio when starting the game", async () => {
    const { container } = render(<Home />);
    const audio = container.querySelector("audio") as HTMLAudioElement;
    const startLink = screen.getByRole("link", { name: /start/i });
    startLink.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(startLink);

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

    // [TC-095] falls back to the first user interaction when autoplay is blocked
  it("falls back to the first user interaction when autoplay is blocked", async () => {
    vi.mocked(window.HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new Error("autoplay blocked")
    );

    render(<Home />);

    const toggle = screen.getByRole("button", { name: "Toggle Menu Audio" });
    expect(toggle).toHaveTextContent("AUDIO: MUTED (CLICK)");

    await act(async () => {});
    fireEvent.click(window);

    await waitFor(() => expect(toggle).toHaveTextContent("AUDIO: PLAYING"));
  });

    // [TC-096] silences lingering game audio when returning to the menu
  it("silences lingering game audio when returning to the menu", () => {
    const lingering = document.createElement("audio");
    lingering.src = "/assets/audio/Alarm.mp3";
    document.body.appendChild(lingering);

    render(<Home />);

    expect(lingering.pause).toHaveBeenCalled();
    expect(lingering.currentTime).toBe(0);

    lingering.remove();
  });
});
