import { describe, expect, it } from "vitest";
import { canSeeMemberProgress, type StudyGroupMember } from "./types";

const member = (userId: string, role: StudyGroupMember["role"], shareProgress: boolean): StudyGroupMember => ({
  groupId: "group-1", userId, role, shareProgress, joinedAt: "2026-10-16T12:00:00.000Z"
});

describe("community privacy contract", () => {
  it("não expõe progresso sem consentimento explícito", () => {
    expect(canSeeMemberProgress(member("leader", "leader", true), member("student", "member", false))).toBe(false);
  });
  it("permite ao líder ver somente dados consentidos do mesmo grupo", () => {
    expect(canSeeMemberProgress(member("leader", "leader", true), member("student", "member", true))).toBe(true);
  });
});
