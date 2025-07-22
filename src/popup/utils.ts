export function generateUniqueId(): string {
  return (
    "id-" + performance.now().toString(36) + Math.random().toString(36).slice(2)
  );
}
