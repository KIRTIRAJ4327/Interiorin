import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("foundation page", () => {
  it("states the product truth boundary and core foundations", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /bring the space/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Spatial truth")).toBeInTheDocument();
    expect(screen.getByText("Bounded refinement")).toBeInTheDocument();
    expect(screen.getByText("Decision memory")).toBeInTheDocument();
    expect(screen.getByText(/does not simulate a finished model/i)).toBeInTheDocument();
  });
});
