function elementReaction(a, b) {
  const pairs = new Set([
    ["Hỏa","Thủy"].sort().join("|"),
    ["Mộc","Hỏa"].sort().join("|"),
    ["Thủy","Lôi"].sort().join("|"),
    ["Băng","Thủy"].sort().join("|")
  ]);
  const key = [a,b].sort().join("|");
  if (key === ["Hỏa","Thủy"].sort().join("|")) return "Hơi Nước";
  if (key === ["Hỏa","Mộc"].sort().join("|")) return "Thiêu Đốt";
  if (key === ["Lôi","Thủy"].sort().join("|")) return "Điện Kích";
  if (key === ["Băng","Thủy"].sort().join("|")) return "Đóng Băng";
  return null;
}

function calculateDamage(attacker, defender, skill = {}) {
  const atk = (attacker.attack || 0) * (skill.multiplier || 1);
  const pen = Math.min(0.8, (attacker.penetration || 0) / 100);
  const defense = (defender.defense || 0) * (1 - pen);
  let damage = Math.max(1, atk - defense * 0.45);
  let critical = Math.random() * 100 < (attacker.crit || 0);
  if (critical) damage *= (attacker.critDamage || 150) / 100;
  return { damage: Math.floor(damage), critical };
}

function applyStatus(target, status, duration = 2) {
  target.statuses ||= [];
  target.statuses.push({ status, duration });
  return target;
}

function tickStatuses(target) {
  if (!target.statuses) return [];
  const results = [];
  target.statuses = target.statuses.filter(s => {
    if (["burn","bleed","poison"].includes(s.status)) {
      const amount = Math.max(1, Math.floor((target.maxHp || 100) * 0.03));
      target.hp = Math.max(0, target.hp - amount);
      results.push({ status: s.status, damage: amount });
    }
    s.duration--;
    return s.duration > 0;
  });
  return results;
}

module.exports = { calculateDamage, applyStatus, tickStatuses, elementReaction };
