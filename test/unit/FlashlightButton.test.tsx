import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FlashlightButton } from "@/components/cctv/FlashlightButton";

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
    // [TC-073] shows the idle label when the flashlight is off
  it("shows the idle label when the flashlight is off", () => {
    setup();

    expect(
      screen.getByRole("button", { name: "Hold Flashlight" })
    ).toHaveTextContent("HOLD FLASHLIGHT");
    expect(screen.getByText("[HOLD SPACE]")).toBeInTheDocument();
  });

    // [TC-074] shows the active label when the flashlight is on
  it("shows the active label when the flashlight is on", () => {
    setup({ isOn: true });

    expect(screen.getByText("LIGHT: ACTIVE")).toBeInTheDocument();
    expect(screen.queryByText("HOLD FLASHLIGHT")).not.toBeInTheDocument();
  });

    // [TC-075] calls onPressStart when the pointer goes down
  it("calls onPressStart when the pointer goes down", () => {
    const { onPressStart, onPressEnd } = setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    fireEvent.pointerDown(button);

    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressEnd).not.toHaveBeenCalled();
  });

    // [TC-076] calls onPressEnd when the pointer is released
  it("calls onPressEnd when the pointer is released", () => {
    const { onPressStart, onPressEnd } = setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    fireEvent.pointerUp(button);

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressStart).not.toHaveBeenCalled();
  });

    // [TC-077] calls onPressEnd when the pointer leaves the button
  it("calls onPressEnd when the pointer leaves the button", () => {
    const { onPressEnd } = setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    fireEvent.pointerLeave(button);

    expect(onPressEnd).toHaveBeenCalledTimes(1);
  });

    // [TC-078] prevents the context menu while holding
  it("prevents the context menu while holding", () => {
    setup();
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    const notCancelled = fireEvent.contextMenu(button);

    expect(notCancelled).toBe(false);
  });

    // [TC-079] applies the disabled styling when disabled
  it("applies the disabled styling when disabled", () => {
    setup({ disabled: true });
    const button = screen.getByRole("button", { name: "Hold Flashlight" });

    expect(button.className).toContain("border-red-900/60");
  });
});
