import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LosePage from "@/app/lose/page";

describe("Lose page", () => {
    // [TC-113] renders the game over message
  it("renders the game over message", () => {
    render(<LosePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Game Over" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("SIGNAL LOST — BREACH DETECTED")
    ).toBeInTheDocument();
    expect(
      screen.getByText("ANOMALY REACHED SECURITY OFFICE")
    ).toBeInTheDocument();
  });

    // [TC-114] offers retry and main menu actions
  it("offers retry and main menu actions", () => {
    render(<LosePage />);

    expect(screen.getByRole("link", { name: "Retry" })).toHaveAttribute(
      "href",
      "/game"
    );
    expect(screen.getByRole("link", { name: "Main Menu" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
