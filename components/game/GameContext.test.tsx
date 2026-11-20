import { act, fireEvent, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GameProvider,
  SECONDS_PER_HOUR,
  TOTAL_FLASHLIGHT_SECONDS,
  TOTAL_GAME_SECONDS,
  useGame,
} from "./GameContext";
import { pushMock, setPathname } from "@/test/mocks/next-navigation";

function renderGame() {
  return renderHook(() => useGame(), { wrapper: GameProvider });
}

describe("game configuration", () => {
  it("runs for two real minutes split into six in-game hours", () => {
    expect(TOTAL_GAME_SECONDS).toBe(120);
    expect(SECONDS_PER_HOUR).toBe(20);
    expect(TOTAL_GAME_SECONDS / SECONDS_PER_HOUR).toBe(6);
  });

  it("gives the flashlight 30 seconds of battery", () => {
    expect(TOTAL_FLASHLIGHT_SECONDS).toBe(30);
  });
});

describe("useGame", () => {
  beforeEach(() => {
    setPathname("/game");
    vi.useFakeTimers();
  });

  it("throws when used outside of a GameProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useGame())).toThrow(
      "useGame must be used within a GameProvider"
    );
  });

  it("starts with the tutorial shown and the game paused", () => {
    const { result } = renderGame();

    expect(result.current.activeCam).toBe("cam1");
    expect(result.current.battery).toBe(100);
    expect(result.current.isFlashlightOn).toBe(false);
    expect(result.current.isGameRunning).toBe(false);
    expect(result.current.showTutorial).toBe(true);
    expect(result.current.gameTimeElapsed).toBe(0);
    expect(result.current.formattedClock).toBe("12:00 AM");
  });

  it("starts the game when the tutorial is dismissed", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());

    expect(result.current.showTutorial).toBe(false);
    expect(result.current.isGameRunning).toBe(true);
  });

  it("switches the active camera", () => {
    const { result } = renderGame();

    act(() => result.current.setActiveCam("cam3"));

    expect(result.current.activeCam).toBe("cam3");
  });

  it("does not turn the flashlight on before the game starts", () => {
    const { result } = renderGame();

    act(() => result.current.startFlashlight());

    expect(result.current.isFlashlightOn).toBe(false);
  });

  it("turns the flashlight on and off while the game is running", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => result.current.startFlashlight());
    expect(result.current.isFlashlightOn).toBe(true);

    act(() => result.current.stopFlashlight());
    expect(result.current.isFlashlightOn).toBe(false);
  });

  it("advances the in-game clock by one hour every 20 seconds", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());

    act(() => vi.advanceTimersByTime(20_000));
    expect(result.current.formattedClock).toBe("1:00 AM");

    act(() => vi.advanceTimersByTime(20_000));
    expect(result.current.formattedClock).toBe("2:00 AM");

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.formattedClock).toBe("5:00 AM");
  });

  it("drains the battery for exactly 30 seconds of flashlight use", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => result.current.startFlashlight());

    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.battery).toBeCloseTo(66.67, 1);
    expect(result.current.isFlashlightOn).toBe(true);

    act(() => vi.advanceTimersByTime(20_100));
    expect(result.current.battery).toBe(0);
    expect(result.current.isFlashlightOn).toBe(false);
  });

  it("keeps the battery full while the flashlight is off", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => vi.advanceTimersByTime(30_000));

    expect(result.current.battery).toBe(100);
  });

  it("refuses to turn the flashlight on when the battery is empty", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => result.current.startFlashlight());
    act(() => vi.advanceTimersByTime(30_100));

    act(() => result.current.startFlashlight());

    expect(result.current.isFlashlightOn).toBe(false);
    expect(result.current.battery).toBe(0);
  });

  it("wins after surviving the full two minutes", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => vi.advanceTimersByTime(TOTAL_GAME_SECONDS * 1000));

    expect(result.current.gameTimeElapsed).toBe(TOTAL_GAME_SECONDS);
    expect(result.current.formattedClock).toBe("6:00 AM");
    expect(result.current.isGameRunning).toBe(false);
    expect(pushMock).toHaveBeenCalledWith("/win");
  });

  it("does not advance the clock while the tutorial is still open", () => {
    const { result } = renderGame();

    act(() => vi.advanceTimersByTime(10_000));

    expect(result.current.gameTimeElapsed).toBe(0);
  });

  it("ends the game immediately on game over", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => result.current.startFlashlight());
    act(() => result.current.triggerGameOver());

    expect(result.current.isGameRunning).toBe(false);
    expect(result.current.isFlashlightOn).toBe(false);
    expect(pushMock).toHaveBeenCalledWith("/lose");
  });

  it("resets every gameplay value on reset", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => result.current.setActiveCam("cam4"));
    act(() => result.current.startFlashlight());
    act(() => vi.advanceTimersByTime(10_000));

    act(() => result.current.resetGame());

    expect(result.current.activeCam).toBe("cam1");
    expect(result.current.battery).toBe(100);
    expect(result.current.isFlashlightOn).toBe(false);
    expect(result.current.gameTimeElapsed).toBe(0);
    expect(result.current.showTutorial).toBe(true);
    expect(result.current.isGameRunning).toBe(false);
  });

  it("stops the game when leaving the /game route", () => {
    const { result, rerender } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => result.current.startFlashlight());

    setPathname("/");
    rerender();

    expect(result.current.isGameRunning).toBe(false);
    expect(result.current.isFlashlightOn).toBe(false);
  });

  it("resets the session when re-entering the /game route", () => {
    const { result, rerender } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => vi.advanceTimersByTime(10_000));

    setPathname("/");
    rerender();
    setPathname("/game");
    rerender();

    expect(result.current.gameTimeElapsed).toBe(0);
    expect(result.current.battery).toBe(100);
    expect(result.current.showTutorial).toBe(true);
    expect(result.current.isGameRunning).toBe(false);
  });

  it("plays a click sound for interactive elements", () => {
    renderGame();

    const play = vi.mocked(window.HTMLMediaElement.prototype.play);
    play.mockClear();

    const button = document.createElement("button");
    document.body.appendChild(button);

    fireEvent.click(button);

    expect(play).toHaveBeenCalled();
    button.remove();
  });

  it("exposes the formatted clock for the win screen state", () => {
    const { result } = renderGame();

    act(() => result.current.dismissTutorial());
    act(() => vi.advanceTimersByTime(100_000));

    expect(result.current.formattedClock).toBe("5:00 AM");
  });
});
