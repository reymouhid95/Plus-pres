/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AnswerOption } from "./AnswerOption";
import { QuestionCard } from "./QuestionCard";
import { RevealCard } from "./RevealCard";
import { ReactionPicker } from "./ReactionPicker";
import { StatCard } from "./StatCard";
import { EmptyState } from "./EmptyState";
import { MomentCard } from "./MomentCard";
import { ChallengeCard } from "./ChallengeCard";
import { REACTION_EMOJIS } from "@/lib/interactions";

describe("AnswerOption", () => {
  it("affiche le libellé et l'indicateur", () => {
    render(<AnswerOption indicator="A">Chocolat</AnswerOption>);
    expect(screen.getByText("Chocolat")).toBeTruthy();
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("notifie le clic et respecte l'état sélectionné", () => {
    const onClick = vi.fn();
    render(
      <AnswerOption indicator="B" selected onClick={onClick} testId="answer-option">
        Vanille
      </AnswerOption>
    );
    const button = screen.getByTestId("answer-option");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.className).toContain("border-accent/60");
  });

  it("est désactivable", () => {
    const onClick = vi.fn();
    render(<AnswerOption disabled onClick={onClick} testId="answer-option">Vanille</AnswerOption>);
    fireEvent.click(screen.getByTestId("answer-option"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("QuestionCard", () => {
  it("affiche le badge, la question et l'indice", () => {
    render(
      <QuestionCard text="Ton dessert préféré ?" badge="Tour 1" hint="Réponds vite">
        contenu
      </QuestionCard>
    );
    expect(screen.getByText("Tour 1")).toBeTruthy();
    expect(screen.getByText("Ton dessert préféré ?")).toBeTruthy();
    expect(screen.getByText("Réponds vite")).toBeTruthy();
    expect(screen.getByText("contenu")).toBeTruthy();
  });
});

describe("RevealCard", () => {
  const answers = [
    { label: "Vous", value: "Tiramisu" },
    { label: "Léa", value: "Tiramisu" },
  ];

  it("affiche l'alignement quand les réponses correspondent", () => {
    render(<RevealCard question="Dessert ?" matched answers={answers} testId="reveal-result" />);
    expect(screen.getByText("Vous êtes alignés")).toBeTruthy();
    expect(screen.getAllByText("Tiramisu")).toHaveLength(2);
  });

  it("affiche la divergence sinon", () => {
    render(
      <RevealCard question="Dessert ?" matched={false} answers={answers} testId="reveal-result" />
    );
    expect(screen.getByText("Vous avez choisi différemment.")).toBeTruthy();
  });
});

describe("ReactionPicker", () => {
  it("propose les 6 réactions et notifie la sélection", () => {
    const onSelect = vi.fn();
    render(<ReactionPicker onSelect={onSelect} testId="reactions" />);
    const buttons = screen.getByTestId("reactions").querySelectorAll("button");
    expect(buttons).toHaveLength(REACTION_EMOJIS.length);
    fireEvent.click(buttons[0]);
    expect(onSelect).toHaveBeenCalledWith(REACTION_EMOJIS[0]);
  });

  it("se désactive pendant la révélation", () => {
    render(<ReactionPicker onSelect={() => {}} disabled testId="reactions" />);
    const buttons = screen.getByTestId("reactions").querySelectorAll("button");
    expect(buttons[0]).toHaveProperty("disabled", true);
  });
});

describe("StatCard", () => {
  it("affiche la valeur, le libellé et la légende", () => {
    render(<StatCard label="Parties" value={12} caption="cette semaine" />);
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("Parties")).toBeTruthy();
    expect(screen.getByText("cette semaine")).toBeTruthy();
  });
});

describe("EmptyState", () => {
  it("affiche le titre, le message et une action", () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Aucune partie"
        message="Commencez votre première expérience."
        action={{ label: "Commencer", onClick }}
      />
    );
    expect(screen.getByText("Aucune partie")).toBeTruthy();
    fireEvent.click(screen.getByText("Commencer"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("rend une action sous forme de lien", () => {
    render(<EmptyState title="Rien ici" action={{ label: "Aller au journal", href: "/history" }} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/history");
  });
});

describe("MomentCard", () => {
  it("affiche le titre, le contenu et la date", () => {
    render(<MomentCard title="Notre défi" content="Aller courir ensemble" date="12 sept." />);
    expect(screen.getByText("Notre défi")).toBeTruthy();
    expect(screen.getByText("Aller courir ensemble")).toBeTruthy();
    expect(screen.getByText("12 sept.")).toBeTruthy();
  });
});

describe("ChallengeCard", () => {
  it("affiche un défi à faire", () => {
    render(<ChallengeCard title="Penser à l'autre" />);
    expect(screen.getByText("Penser à l'autre")).toBeTruthy();
    expect(screen.getByText("À faire")).toBeTruthy();
  });

  it("affiche un défi accompli avec sa date", () => {
    render(<ChallengeCard title="Penser à l'autre" completed completedAt="12 sept." />);
    expect(screen.getByText("Accompli — 12 sept.")).toBeTruthy();
  });
});
