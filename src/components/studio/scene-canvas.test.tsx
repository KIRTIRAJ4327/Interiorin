import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clonePreparedScene } from "@/lib/spatial/prepared-scenes";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="three-canvas" />,
  useThree: () => ({
    camera: {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    },
  }),
}));

vi.mock("@react-three/drei", () => ({
  ContactShadows: () => null,
  Edges: () => null,
  OrbitControls: () => null,
}));

import { SceneCanvas } from "./scene-canvas";

describe("prepared scene canvas resilience", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("derives its semantic equivalent from the canonical scene", () => {
    const scene = clonePreparedScene("interior");
    const table = scene.objects.find((object) => object.id === "table");
    if (!table) throw new Error("Prepared table fixture is missing.");
    table.transform.position.x = 1.1;

    render(<SceneCanvas scene={scene} />);
    fireEvent.click(screen.getByRole("button", { name: "Open semantic scene" }));

    expect(screen.getByText("1,600 mm × 900 mm × 750 mm · centre x 1,100 mm")).toBeInTheDocument();
    expect(screen.getByText("5,200 mm × 4,000 mm × 2,700 mm")).toBeInTheDocument();
    expect(screen.getByText("900 mm edge clearance")).toBeInTheDocument();
  });

  it("shows the error-boundary fallback without removing semantic controls", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<SceneCanvas scene={clonePreparedScene("interior")} forceFailure />);

    expect(await screen.findByRole("img", { name: "Semantic fallback for the prepared dining room" })).toHaveTextContent(
      "3D view unavailable. Continue with the complete semantic proof.",
    );
    expect(screen.getByRole("button", { name: "Rotate view" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reset view" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Open semantic scene" }));
    expect(screen.getByText("1,600 mm × 900 mm × 750 mm · centre x 920 mm")).toBeInTheDocument();
    expect(screen.getByText("900 mm edge clearance")).toBeInTheDocument();
  });
});
