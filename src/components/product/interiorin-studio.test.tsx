import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./studio-model", () => ({
  StudioModel: ({ scene }: { scene: { name: string; objects: Array<{ id: string; transform: { position: { x: number } } }> } }) => (
    <div data-testid="studio-model">{scene.name} · table x {scene.objects.find((object) => object.id === "table")?.transform.position.x}</div>
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

  it("generates options, refines the canonical scene, and saves a factual version", () => {
    render(<InteriorinStudio />);
    expect(screen.getByRole("heading", { name: "Start with the space you have." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /generate three spatial directions/i }));

    expect(screen.getByRole("heading", { name: "Three ways this space can work." })).toBeInTheDocument();
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

  it("builds exterior options with an explicit professional boundary", () => {
    render(<InteriorinStudio />);
    fireEvent.click(screen.getByRole("button", { name: "Exterior" }));
    fireEvent.click(screen.getByRole("button", { name: /generate three spatial directions/i }));

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /sheltered court/i })).toBeInTheDocument();
    expect(screen.getByText(/Survey, setbacks, utilities, grade and drainage required/i)).toBeInTheDocument();
  });
});
