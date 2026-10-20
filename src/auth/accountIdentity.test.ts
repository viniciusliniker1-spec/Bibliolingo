import { describe, expect, it } from "vitest";
import {
  accountUsernameError,
  getAccountUsername,
  normalizeAccountUsername
} from "./accountIdentity";

describe("account identity", () => {
  it("normaliza nomes para um identificador legível", () => {
    expect(normalizeAccountUsername("  João da Silva  ")).toBe("joao.da.silva");
    expect(normalizeAccountUsername("Ana__Maria")).toBe("ana.maria");
  });

  it("prioriza o nome de usuário salvo e usa fallbacks seguros", () => {
    expect(getAccountUsername({
      id: "abc123",
      email: "aluno@example.com",
      user_metadata: { username: "meu.perfil", display_name: "Outro nome" }
    })).toBe("meu.perfil");
    expect(getAccountUsername({
      id: "abc123",
      email: "aluno@example.com",
      user_metadata: {}
    })).toBe("aluno");
  });

  it("valida o formato editável", () => {
    expect(accountUsernameError("ab")).toBeTruthy();
    expect(accountUsernameError("Nome Com Espaço")).toBeTruthy();
    expect(accountUsernameError("aluno.123")).toBeUndefined();
  });
});
