export function getParticipantId(): string {
  if (typeof window === "undefined") return "00000000-0000-0000-0000-000000000000";
  const key = "participant_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}
