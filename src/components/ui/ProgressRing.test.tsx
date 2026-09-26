/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProgressRing from "./ProgressRing";

describe("ProgressRing", () => {
  it("expose un libellé lisible par les lecteurs d'écran", () => {
    render(<ProgressRing value={42} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Compatibilité 42 %");
  });

  it("borne la valeur affichée entre 0 et 100", () => {
    render(<ProgressRing value={150} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Compatibilité 100 %");
    expect(screen.getByRole("img").textContent).toContain("100");
  });

  it("n'affiche jamais une valeur négative", () => {
    render(<ProgressRing value={-20} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Compatibilité 0 %");
  });

  it("anime le trait circulaire jusqu'à la valeur", async () => {
    const { container } = render(<ProgressRing value={75} size={100} stroke={10} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);

    const progress = circles[1];
    const circumference = 2 * Math.PI * 45;

    await waitFor(() => {
      const offset = Number(progress.getAttribute("stroke-dashoffset"));
      expect(Math.abs(offset - circumference * 0.25)).toBeLessThan(1);
    });
  });
});
