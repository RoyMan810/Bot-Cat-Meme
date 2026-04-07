import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../repositories/prisma';
import { UserRepository } from '../repositories/user-repository';

export class DailyService {
  constructor(private readonly userRepo = new UserRepository()) {}

  async claimDaily(userId: number) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const alreadyClaimed = await prisma.dailyReward.findFirst({
      where: { userId, claimedAt: { gte: today } },
    });

    if (alreadyClaimed) {
      return { claimed: false, coins: 0 };
    }

    const user = await this.userRepo.getById(userId);
    if (!user) throw new Error('User not found');

    let streakDays = 1;
    if (user.lastLoginAt) {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const last = new Date(user.lastLoginAt);
      last.setUTCHours(0, 0, 0, 0);
      streakDays = last.getTime() === yesterday.getTime() ? user.streakDays + 1 : 1;
    }

    const streakBonus = Math.min(streakDays * 5, 50);
    const reward = env.dailyRewardCoins + streakBonus;

    await prisma.$transaction([
      prisma.dailyReward.create({ data: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: reward }, streakDays, lastLoginAt: new Date() },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount: reward,
          type: 'daily',
          note: `Daily reward with streak ${streakDays}`,
        },
      }),
    ] as Prisma.PrismaPromise<unknown>[]);

    return { claimed: true, coins: reward, streakDays };
  }
}
