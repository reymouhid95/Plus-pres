import { describe, expect, it } from "vitest";
import {
  answerSchema,
  discussSchema,
  guestSchema,
  joinSchema,
  normalizeCode,
  profileSchema,
  reactSchema,
  registerSchema,
  upgradeSchema,
} from "./validation";

describe("registerSchema", () => {
  const valid = { email: "camille@example.fr", password: "secret123", displayName: "Camille" };

  it("accepte un inscription valide", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un email mal formé", () => {
    expect(registerSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
  });

  it("refuse un mot de passe trop court", () => {
    expect(registerSchema.safeParse({ ...valid, password: "12345" }).success).toBe(false);
  });

  it("refuse un pseudo vide ou trop long", () => {
    expect(registerSchema.safeParse({ ...valid, displayName: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, displayName: "x".repeat(41) }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepte un profil partiel", () => {
    expect(profileSchema.safeParse({ displayName: "Nina" }).success).toBe(true);
    expect(profileSchema.safeParse({}).success).toBe(true);
  });

  it("borne la bio à 280 caractères", () => {
    expect(profileSchema.safeParse({ bio: "x".repeat(280) }).success).toBe(true);
    expect(profileSchema.safeParse({ bio: "x".repeat(281) }).success).toBe(false);
  });
});

describe("answerSchema", () => {
  it("exige une manche et un choix non vide", () => {
    expect(answerSchema.safeParse({ roundId: "r1", choice: "Café" }).success).toBe(true);
    expect(answerSchema.safeParse({ roundId: "", choice: "Café" }).success).toBe(false);
    expect(answerSchema.safeParse({ roundId: "r1", choice: "" }).success).toBe(false);
  });
});

describe("joinSchema", () => {
  it("impose un code de 4 à 10 caractères", () => {
    expect(joinSchema.safeParse({ code: "ABCD" }).success).toBe(true);
    expect(joinSchema.safeParse({ code: "ABC" }).success).toBe(false);
    expect(joinSchema.safeParse({ code: "A".repeat(11) }).success).toBe(false);
  });
});

describe("normalizeCode", () => {
  it("met le code en majuscules et retire les espaces", () => {
    expect(normalizeCode("  aB12 ")).toBe("AB12");
    expect(normalizeCode("wSDWqK")).toBe("WSDWQK");
  });
});

describe("guestSchema", () => {
  it("accepte un pseudo de 2 à 30 caractères", () => {
    expect(guestSchema.safeParse({ displayName: "Sarah" }).success).toBe(true);
    expect(guestSchema.safeParse({ displayName: " A " }).success).toBe(false);
    expect(guestSchema.safeParse({ displayName: "A".repeat(31) }).success).toBe(false);
    expect(guestSchema.safeParse({ displayName: "" }).success).toBe(false);
  });

  it("retire les espaces autour du pseudo", () => {
    expect(guestSchema.safeParse({ displayName: "  Sarah  " }).data).toEqual({
      displayName: "Sarah",
    });
  });
});

describe("upgradeSchema", () => {
  it("accepte une conversion valide", () => {
    expect(
      upgradeSchema.safeParse({ email: "sarah@exemple.fr", password: "secret12" }).success,
    ).toBe(true);
  });

  it("refuse un email mal formé ou un mot de passe trop court", () => {
    expect(
      upgradeSchema.safeParse({ email: "pas-un-email", password: "secret12" }).success,
    ).toBe(false);
    expect(
      upgradeSchema.safeParse({ email: "sarah@exemple.fr", password: "court" }).success,
    ).toBe(false);
  });
});

describe("reactSchema", () => {
  it("accepte un emoji de la liste", () => {
    expect(reactSchema.safeParse({ roundId: "r1", emoji: "🔥" }).success).toBe(true);
    expect(reactSchema.safeParse({ roundId: "r1", emoji: "💩" }).success).toBe(false);
    expect(reactSchema.safeParse({ roundId: "", emoji: "❤️" }).success).toBe(false);
  });
});

describe("discussSchema", () => {
  it("accepte les trois actions sans contenu", () => {
    for (const type of ["pourquoi", "defendre", "compromis"] as const) {
      expect(discussSchema.safeParse({ roundId: "r1", type }).success).toBe(true);
    }
    expect(
      discussSchema.safeParse({ roundId: "r1", type: "dispute" }).success,
    ).toBe(false);
  });

  it("exige une motivation valide pour le type motivation", () => {
    expect(
      discussSchema.safeParse({ roundId: "r1", type: "motivation", content: "Culture" })
        .success,
    ).toBe(true);
    expect(
      discussSchema.safeParse({ roundId: "r1", type: "motivation", content: "Hasard" })
        .success,
    ).toBe(false);
    expect(discussSchema.safeParse({ roundId: "r1", type: "motivation" }).success).toBe(
      false,
    );
  });
});
