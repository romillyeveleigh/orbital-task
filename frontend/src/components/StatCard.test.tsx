/**
 * Tests for StatCard component.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "../test/utils";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Total Credits" value="123.45" />);

    expect(screen.getByText("Total Credits")).toBeInTheDocument();
    expect(screen.getByText("123.45")).toBeInTheDocument();
  });

  it("renders with suffix", () => {
    render(<StatCard label="Messages" value={100} suffix="msgs" />);

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("msgs")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(
      <StatCard
        label="Test"
        value="42"
        icon={<svg data-testid="test-icon" />}
      />,
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies highlight styling when highlight prop is true", () => {
    render(<StatCard label="Highlighted" value="999" highlight />);

    const valueElement = screen.getByText("999");
    expect(valueElement).toHaveClass("gradient-text-hero");
  });

  it("does not apply highlight styling by default", () => {
    render(<StatCard label="Normal" value="999" />);

    const valueElement = screen.getByText("999");
    expect(valueElement).not.toHaveClass("gradient-text-hero");
  });
});
