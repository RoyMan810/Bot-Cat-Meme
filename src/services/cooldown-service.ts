export class CooldownService {
  private readonly actionTimestamps = new Map<string, number>();

  constructor(private readonly cooldownSeconds: number) {}

  check(userId: number, action: string) {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const cooldownMs = this.cooldownSeconds * 1000;
    const lastTs = this.actionTimestamps.get(key);

    if (lastTs && now - lastTs < cooldownMs) {
      const left = Math.ceil((cooldownMs - (now - lastTs)) / 1000);
      return { allowed: false, secondsLeft: left };
    }

    this.actionTimestamps.set(key, now);
    return { allowed: true, secondsLeft: 0 };
  }
}
