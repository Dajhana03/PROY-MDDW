// utils/levels.js

export function getUserLevel(userData, donations) {
  const totalPoints = (userData.points || 0) + (donations.length * 50);
  let userLevel = "Reciclador Novato";
  if (totalPoints >= 150) userLevel = "Eco-Guardián";
  if (totalPoints >= 500) userLevel = "Héroe Verde 🥦";
  return { totalPoints, userLevel };
}

export const LEVEL_COLORS = {
  "Reciclador Novato": "#84cc16",
  "Eco-Guardián": "#10b981",
  "Héroe Verde 🥦": "#059669",
};