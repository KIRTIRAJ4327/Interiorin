import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { sceneCanvasSpy } = vi.hoisted(() => ({ sceneCanvasSpy: vi.fn() }));

vi.mock("@/components/studio/scene-canvas", () => ({
  SceneCanvas: (props: unknown) => {
    sceneCanvasSpy(props);
    return <div data-testid="scene-canvas">Prepared 3D scene</div>;
  },
}));

import Home from "./page";

describe("authority-gated spatial proof", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sceneCanvasSpy.mockClear();
  });

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
    for (const leaked of ["18 cm", "180 mm", "+18", "+180", "1,100 mm"]) {
      expect(document.body).not.toHaveTextContent(leaked);
    }
    const accessibleMetadata = Array.from(
      document.querySelectorAll("[aria-label], [aria-description], [title]"),
      (element) => ["aria-label", "aria-description", "title"]
        .map((attribute) => element.getAttribute(attribute) ?? "")
        .join(" "),
    ).join(" ");
    expect(accessibleMetadata).not.toMatch(/180 mm|18 cm|\+180|\+18|1,100 mm/i);
    expect(sceneCanvasSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ previewPosition: undefined }),
    );
    expect(screen.queryByRole("button", { name: /accept/i })).not.toBeInTheDocument();

    const recordMeasurement = screen.getByRole("button", { name: /record measurement/i });
    expect(recordMeasurement).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: /i measured this 100 cm value/i }));
    expect(recordMeasurement).toBeEnabled();
    fireEvent.click(recordMeasurement);
    expect(await screen.findByText("Only authority changed.")).toBeInTheDocument();
    expect(screen.queryByText("Observed · unverified")).not.toBeInTheDocument();
    expect(screen.getAllByText("User declared")).toHaveLength(3);
    expect(screen.getByText("Only evidence authority changed.")).toBeInTheDocument();
    expect(screen.getAllByText("MATCH")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /rerun unchanged proposal/i }));
    expect(screen.getByText("40 cm fails. 18 cm passes.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /accept 18 cm alternative/i }));
    expect(await screen.findByText("The checked alternative is now canonical.")).toBeInTheDocument();
    expect(screen.getByText("+18 cm", { selector: "dd" })).toBeInTheDocument();
  });
});
