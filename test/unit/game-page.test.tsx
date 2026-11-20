import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GamePage from "@/app/game/page";
import { GameProvider } from "@/components/game/GameContext";
import { setPathname } from "@/test/mocks/next-navigation";

function renderGamePage() {
  return render(
    <GameProvider>
      <GamePage />
    </GameProvider>
  );
}

describe("Game page", () => {
  beforeEach(() => {
    setPathname("/game");
    vi.useFakeTimers();
  });

    // [TC-097] shows the tutorial before the night begins
  it("shows the tutorial before the night begins", () => {
    renderGamePage();

    expect(
      screen.getByRole("dialog", { name: "Gameplay Instructions" })
    ).toBeInTheDocument();
    expect(screen.getByText("TIME")).toBeInTheDocument();
    expect(screen.getAllByText("12:00 AM").length).toBeGreaterThan(0);
  });

    // [TC-098] starts the shift when the tutorial is dismissed
  it("starts the shift when the tutorial is dismissed", () => {
    const { container } = renderGamePage();

    fireEvent.click(screen.getByRole("dialog"));

    expect(
      screen.queryByRole("dialog", { name: "Gameplay Instructions" })
    ).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1_000));

    expect(container.querySelector("header")).toHaveTextContent("12:00 AM");
  });

    // [TC-099] shows all four camera buttons
  it("shows all four camera buttons", () => {
    renderGamePage();

    for (let index = 1; index <= 4; index += 1) {
      expect(
        screen.getByRole("button", {
          name: new RegExp(`CAM ${index}`),
        })
      ).toBeInTheDocument();
    }
  });

    // [TC-100] switches cameras with the keyboard after a short signal delay
  it("switches cameras with the keyboard after a short signal delay", () => {
    const { container } = renderGamePage();

    fireEvent.click(screen.getByRole("dialog"));

    fireEvent.keyDown(window, { key: "2" });
    expect(container.querySelector("header")).toHaveTextContent("CONNECTING...");

    act(() => vi.advanceTimersByTime(500));

    expect(container.querySelector("header")).toHaveTextContent("CAM 2");
  });

    // [TC-101] switches cameras when a camera button is clicked
  it("switches cameras when a camera button is clicked", () => {
    const { container } = renderGamePage();

    fireEvent.click(screen.getByRole("dialog"));
    fireEvent.click(screen.getByRole("button", { name: /CAM 4/ }));

    act(() => vi.advanceTimersByTime(500));

    expect(container.querySelector("header")).toHaveTextContent("CAM 4");
  });

    // [TC-102] switches cameras with every number hotkey
  it("switches cameras with every number hotkey", () => {
    const { container } = renderGamePage();
    const header = () => container.querySelector("header");

    fireEvent.click(screen.getByRole("dialog"));

    for (const [key, label] of [
      ["2", "CAM 2"],
      ["1", "CAM 1"],
      ["3", "CAM 3"],
      ["4", "CAM 4"],
    ]) {
      fireEvent.keyDown(window, { key });
      act(() => vi.advanceTimersByTime(500));
      expect(header()).toHaveTextContent(label);
    }
  });

    // [TC-103] cancels a pending camera switch when another camera is requested
  it("cancels a pending camera switch when another camera is requested", () => {
    const { container } = renderGamePage();

    fireEvent.click(screen.getByRole("dialog"));

    fireEvent.keyDown(window, { key: "2" });
    fireEvent.keyDown(window, { key: "3" });

    act(() => vi.advanceTimersByTime(500));

    expect(container.querySelector("header")).toHaveTextContent("CAM 3");
  });

    // [TC-104] stops menu, alarm, and jumpscare audio left over from previous screens
  it("stops menu, alarm, and jumpscare audio left over from previous screens", () => {
    const lingering = ["Menu.mp3", "Alarm.mp3", "Jumpscare.mp3"].map((name) => {
      const audio = document.createElement("audio");
      audio.src = `/assets/audio/${name}`;
      document.body.appendChild(audio);
      return audio;
    });

    renderGamePage();

    for (const audio of lingering) {
      expect(audio.pause).toHaveBeenCalled();
      expect(audio.currentTime).toBe(0);
      audio.remove();
    }
  });

    // [TC-105] dismisses the tutorial instead of switching cameras on the first key press
  it("dismisses the tutorial instead of switching cameras on the first key press", () => {
    const { container } = renderGamePage();

    fireEvent.keyDown(window, { key: "3" });

    expect(container.querySelector("header")).toHaveTextContent("CAM 1");
    expect(
      screen.queryByRole("dialog", { name: "Gameplay Instructions" })
    ).not.toBeInTheDocument();
  });

    // [TC-106] holds the flashlight while the space bar is pressed
  it("holds the flashlight while the space bar is pressed", () => {
    renderGamePage();

    fireEvent.click(screen.getByRole("dialog"));

    fireEvent.keyDown(window, { code: "Space" });
    expect(screen.getByText("LIGHT: ACTIVE")).toBeInTheDocument();

    fireEvent.keyUp(window, { code: "Space" });
    expect(screen.getByText("HOLD FLASHLIGHT")).toBeInTheDocument();
  });

    // [TC-107] renders the battery indicator
  it("renders the battery indicator", () => {
    renderGamePage();

    expect(screen.getByText("BATTERY")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
