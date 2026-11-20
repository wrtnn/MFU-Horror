import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FlashlightButton } from "./FlashlightButton";

function setup(props: Partial<React.ComponentProps<typeof FlashlightButton>> = {}) {
  const onPressStart = vi.fn();
  const onPressEnd = vi.fn();

  const view = render(
    <FlashlightButton
      isOn={false}
      onPressStart={onPressStart}
      onPressEnd={onPressEnd}
      {...props}
    />
  );

  return { ...view, onPressStart, onPressEnd };
}

describe("FlashlightButton", () => {
  it("shows the idle label when the flashlight is off", () => {
    setup();

    expect(
      screen.getByRole("button", { name: "Hold Flashlight" })
    ).toHaveTextContent("HOLD FLASHLIGHT");
    expect(screen.getByText("[HOLD SPACE]")).toBeInTheDocument();
  });

  it("shows the active label when the flashlight is on", () => {
    setup({ isOn: true });

    expect(screen.getByText("LIGHT: ACTIVE")).toBeInTheDocument();
    expect(screen.queryByText("HOLD FLASHLIGHT")).not.toBeInTheDocument();
  });

  it("calls onPressStart when the pointer goes down", () => {
    const { onPressStart, onPressEnd } = setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    fireEvent.pointerDown(button);

    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressEnd).not.toHaveBeenCalled();
  });

  it("calls onPressEnd when the pointer is released", () => {
    const { onPressStart, onPressEnd } = setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    fireEvent.pointerUp(button);

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressStart).not.toHaveBeenCalled();
  });

  it("calls onPressEnd when the pointer leaves the button", () => {
    const { onPressEnd } = setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    fireEvent.pointerLeave(button);

    expect(onPressEnd).toHaveBeenCalledTimes(1);
  });

  it("prevents the context menu while holding", () => {
    setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    const notCancelled = fireEvent.contextMenu(button);

    expect(notCancelled).toBe(false);
  });

  it("applies the disabled styling when disabled", () => {
    setup({ disabled: true });
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    expect(button.className).toContain("border-red-900/60");
  });
});
