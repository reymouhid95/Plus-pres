/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Toaster, toast } from "./Toaster";

describe("Toaster", () => {
  it("n'affiche rien quand la file est vide", () => {
    const { container } = render(<Toaster />);
    expect(container.querySelectorAll("p").length).toBe(0);
  });

  it("affiche le message et le ferme au clic", () => {
    render(<Toaster />);

    act(() => {
      toast("Partie créée.", "success");
    });
    expect(screen.getByText("Partie créée.")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Fermer"));
    expect(screen.queryByText("Partie créée.")).toBeNull();
  });

  it("empile plusieurs messages", () => {
    render(<Toaster />);

    act(() => {
      toast("Premier message", "info");
      toast("Second message", "error");
    });

    expect(screen.getByText("Premier message")).toBeTruthy();
    expect(screen.getByText("Second message")).toBeTruthy();
    expect(screen.getAllByLabelText("Fermer")).toHaveLength(2);
  });
});
