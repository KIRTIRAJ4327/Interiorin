import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./studio-model", () => ({
  StudioModel: ({ scene, onDirectAction }: { scene: { name: string; objects: Array<{ id: string; label: string; transform: { position: { x: number; y: number; z: number } } }> }; onDirectAction?: (action: { type: "move_object"; objectId: string; position: { x: number; y: number; z: number } }, summary: string) => void }) => (
    <div data-testid="studio-model">{scene.name} · table x {scene.objects.find((object) => object.id === "table")?.transform.position.x}<button type="button" onClick={() => { const table = scene.objects.find((object) => object.id === "table"); if (table) onDirectAction?.({ type: "move_object", objectId: "table", position: { ...table.transform.position, x: table.transform.position.x + 0.1 } }, "3D control · move Central table right 100 mm."); }}>Mock direct nudge</button></div>
  ),
}));

import { InteriorinStudio } from "./interiorin-studio";

describe("full Interiorin studio journey", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("generates options, refines the canonical scene, and saves a factual version", async () => {
    render(<InteriorinStudio />);
    expect(screen.getByRole("heading", { name: "Start with the space you have." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /generate three spatial directions/i }));

    expect(await screen.findByRole("heading", { name: "Three ways this space can work." })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /clear passage/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("studio-model")).toHaveTextContent("Clear Passage");

    fireEvent.click(screen.getByRole("button", { name: /compile action/i }));
    expect(screen.getByText("Move Central table right 300 mm.")).toBeInTheDocument();
    expect(screen.getByTestId("studio-model")).not.toHaveTextContent("3.836");
    fireEvent.click(screen.getByRole("button", { name: /commit checked action/i }));
    expect(screen.getByText(/Central table can move/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save factual version/i }));
    expect(screen.getAllByText("First direction")).toHaveLength(3);
    expect(localStorage.getItem("interiorin.studio.versions.v1")).toContain("First direction");
  });

  it("builds exterior options with an explicit professional boundary", async () => {
    render(<InteriorinStudio />);
    fireEvent.click(screen.getByRole("button", { name: "Exterior" }));
    fireEvent.click(screen.getByRole("button", { name: /generate three spatial directions/i }));

    expect(await screen.findAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /sheltered court/i })).toBeInTheDocument();
    expect(screen.getByText(/Survey, setbacks, utilities, grade and drainage required/i)).toBeInTheDocument();
  });

  it("commits lighting and restores the previous canonical state through undo", async () => {
    render(<InteriorinStudio />);
    fireEvent.click(screen.getByRole("button", { name: /empty space/i }));
    fireEvent.click(screen.getByRole("button", { name: /generate three spatial directions/i }));
    await screen.findAllByRole("radio");

    fireEvent.change(screen.getByLabelText("Command"), { target: { value: "Make the room warm and bright" } });
    fireEvent.click(screen.getByRole("button", { name: /compile action/i }));
    expect(screen.getByText("Set the scene lighting to warm and bright.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /commit checked action/i }));
    expect(screen.getByText(/Environment set to warm, bright/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Command"), { target: { value: "Undo that" } });
    fireEvent.click(screen.getByRole("button", { name: /compile action/i }));
    fireEvent.click(screen.getByRole("button", { name: /commit checked action/i }));
    expect(screen.getByText("Restored the previous committed canonical scene.")).toBeInTheDocument();
  });

  it("routes direct 3D controls through canonical mutation, history, and receipts", async () => {
    render(<InteriorinStudio />);
    fireEvent.click(screen.getByRole("button", { name: /empty space/i }));
    fireEvent.click(screen.getByRole("button", { name: /generate three spatial directions/i }));
    await screen.findAllByRole("radio");
    const before = screen.getByTestId("studio-model").textContent;
    fireEvent.click(screen.getByRole("button", { name: "Mock direct nudge" }));
    expect(screen.getByTestId("studio-model").textContent).not.toBe(before);
    expect(screen.getByText(/Central table can move to the requested position/i)).toBeInTheDocument();
    expect(screen.getByText("3D control · move Central table right 100 mm.")).toBeInTheDocument();
  });

  it("analyzes an uploaded space and carries visible observations into the workbench", async () => {
    vi.stubGlobal("URL", class MockURL extends URL {
      static createObjectURL = vi.fn(() => "blob:room");
      static revokeObjectURL = vi.fn();
    });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).includes("concept-render") ? {
      status: "generated",
      disclosure: "Presentation hypothesis only.",
      imageDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      model: "nano-banana-test",
      createdAt: "2026-07-18T12:00:00.000Z",
    } : {
      status: "analyzed",
      disclosure: "Visible cues only; dimensions remain entered.",
      model: "gemini-test",
      analysis: {
        spaceKind: "interior",
        spaceType: "living room",
        summary: "A bright room with a rear window and fixed bench.",
        confidence: "medium",
        openings: [{ kind: "window", label: "Rear window", position: "center", confidence: "high" }],
        retainedObjects: [{ label: "Fixed bench", category: "seating", position: "left", confidence: "high", likelyMovable: false }],
        styleCues: [{ label: "warm timber", confidence: "medium" }],
        naturalLight: { level: "high", note: "Strong daylight at the rear.", confidence: "high" },
        reviewRisks: [],
        clarificationQuestions: ["Measure the window opening."],
        metricWarning: "No metric dimensions were inferred from the uncalibrated source.",
      },
    }), { headers: { "Content-Type": "application/json" } })));

    render(<InteriorinStudio />);
    const source = new File(["image"], "real-room.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText(/optional photo or plan reference/i), { target: { files: [source] } });
    fireEvent.click(screen.getByRole("button", { name: /generate three spatial directions/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/space-analysis", expect.objectContaining({ method: "POST" })));
    expect(await screen.findByText(/visible-space read · medium confidence/i)).toBeInTheDocument();
    expect(await screen.findAllByRole("radio")).toHaveLength(3);
    expect(screen.getByText(/1 retained object · 1 opening/i)).toBeInTheDocument();
    expect(screen.getByText("Measure the window opening.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate in-space concept" }));
    expect(await screen.findByRole("img", { name: "AI-generated in-space concept for Clear Passage" })).toBeInTheDocument();
    expect(screen.getByText("Presentation hypothesis only.")).toBeInTheDocument();
  });
});
