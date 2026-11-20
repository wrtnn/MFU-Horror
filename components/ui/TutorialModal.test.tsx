import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TutorialModal } from "./TutorialModal";

describe("TutorialModal", () => {
  it("renders the instructions dialog", () => {
    render(<TutorialModal onDismiss={vi.fn()} />);

    expect(
      screen.getByRole("dialog", { name: "Gameplay Instructions" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Night Duty Instructions")
    ).toBeInTheDocument();
    expect(screen.getByText("Camera Controls")).toBeInTheDocument();
    expect(
      screen.getByText("Ghost Detection & Timer")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Flashlight Usage & Battery")
    ).toBeInTheDocument();
    expect(screen.getByText("Survival Objective")).toBeInTheDocument();
  });

  it("dismisses when the backdrop is clicked", () => {
    const onDismiss = vi.fn();
    render(<TutorialModal onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("dialog"));

    expect(onDismiss).toHaveBeenCalled();
  });

  it("dismisses when the inner panel is clicked", () => {
    const onDismiss = vi.fn();
    render(<TutorialModal onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText("Night Duty Instructions"));

    expect(onDismiss).toHaveBeenCalled();
  });

  it("dismisses on any key press", () => {
    const onDismiss = vi.fn();
    render(<TutorialModal onDismiss={onDismiss} />);

    fireEvent.keyDown(window, { key: "a" });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("removes the key listener on unmount", () => {
    const onDismiss = vi.fn();
    const { unmount } = render(<TutorialModal onDismiss={onDismiss} />);

    unmount();
    fireEvent.keyDown(window, { key: "a" });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
