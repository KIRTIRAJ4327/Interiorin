import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/studio/scene-canvas", () => ({
  SceneCanvas: () => <div data-testid="scene-canvas">Prepared 3D scene</div>,
}));

import Home from "./page";

describe("authority-gated spatial proof", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("changes the outcome only after the supporting measurement gains authority", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          mode: "prepared_fallback",
          disclosure: "Prepared deterministic clarification; OPENAI_API_KEY is not configured.",
          result: {
            status: "resolved",
            summary: "Move the dining table 40 cm toward the bookcase.",
            operation: "move_object",
            targetId: "table",
            requestedDeltaCm: 40,
            axis: "x",
            constraintIds: ["path-clearance"],
          },
        }),
      }),
    );
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Authority ledger" })).toBeInTheDocument();
    expect(screen.getByText("Observed · unverified")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clarify and check/i }));
    expect(await screen.findByText("Geometry is computable. Authority is not.")).toBeInTheDocument();
    expect(screen.getByText("Prepared typed proposal")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("18 cm");

    fireEvent.click(screen.getByRole("button", { name: /record measurement/i }));
    expect(await screen.findByText("Only authority changed.")).toBeInTheDocument();
    expect(screen.queryByText("Observed · unverified")).not.toBeInTheDocument();
    expect(screen.getAllByText("User declared")).toHaveLength(3);
    expect(screen.getByText("Only evidence authority changed.")).toBeInTheDocument();
    expect(screen.getAllByText("MATCH")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /rerun unchanged proposal/i }));
    expect(screen.getByText("40 cm fails. 18 cm passes.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /accept 18 cm alternative/i }));
    expect(screen.getByText("The checked alternative is now canonical.")).toBeInTheDocument();
    expect(screen.getByText("+18 cm", { selector: "dd" })).toBeInTheDocument();
  });
});
