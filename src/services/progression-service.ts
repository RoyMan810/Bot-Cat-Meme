export class ProgressionService {
  xpForNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.35));
  }

  applyXp(currentLevel: number, currentXp: number, gainedXp: number) {
    let level = currentLevel;
    let xp = currentXp + gainedXp;

    while (xp >= this.xpForNextLevel(level)) {
      xp -= this.xpForNextLevel(level);
      level += 1;
    }

    return { level, xp, leveledUp: level > currentLevel };
  }
}
