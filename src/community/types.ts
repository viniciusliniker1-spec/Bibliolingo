export type CommunityRole = "owner" | "leader" | "member";

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  ownerUserId: string;
  inviteCodeHash: string;
  createdAt: string;
}

export interface StudyGroupMember {
  groupId: string;
  userId: string;
  role: CommunityRole;
  joinedAt: string;
  shareProgress: boolean;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  title: string;
  targetType: "lessons" | "review-sessions" | "active-days";
  target: number;
  startsAt: string;
  endsAt: string;
}

/**
 * Contrato preparado para persistência futura.
 * Nenhum dado individual deve ser agregado sem shareProgress=true.
 * Convites deverão armazenar somente hash, nunca o código em texto aberto.
 */
export function canSeeMemberProgress(viewer: StudyGroupMember, subject: StudyGroupMember) {
  return viewer.groupId === subject.groupId
    && subject.shareProgress
    && (viewer.userId === subject.userId || viewer.role === "owner" || viewer.role === "leader");
}
