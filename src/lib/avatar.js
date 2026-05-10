export function getFallbackAvatarUrl(user) {
  const seed = encodeURIComponent(user?.id || user?.email || user?.name || "traveller");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

export function getUserAvatarUrl(user) {
  return user?.avatarUrl || getFallbackAvatarUrl(user);
}

