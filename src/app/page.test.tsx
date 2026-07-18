import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/studio/scene-canvas", () => ({
  SceneCanvas: () => <div data-testid="scene-canvas">Prepared 3D scene</div>,
}));

import Home from "./page";

describe("authority-gated spatial proof", () => {
  it("changes the outcome only after the supporting measurement gains authority", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Authority ledger" })).toBeInTheDocument();
    expect(screen.getByText("Observed · unverified")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /check before commit/i }));
    expect(screen.getByText("Geometry is computable. Authority is not.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /record measurement/i }));
    expect(screen.getByText("Only authority changed.")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /rerun unchanged proposal/i }));
    expect(screen.getByText("40 cm fails. 18 cm passes.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /accept 18 cm alternative/i }));
    expect(screen.getByText("The checked alternative is now canonical.")).toBeInTheDocument();
    expect(screen.getByText("+18 cm", { selector: "dd" })).toBeInTheDocument();
  });
});
