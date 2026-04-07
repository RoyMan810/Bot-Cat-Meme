import { prisma } from './prisma';

export class UserRepository {
  async upsertTelegramUser(telegramId: bigint, username?: string, firstName?: string) {
    return prisma.user.upsert({
      where: { telegramId },
      update: { username, firstName },
      create: { telegramId, username, firstName },
    });
  }

  async getByTelegramId(telegramId: bigint) {
    return prisma.user.findUnique({ where: { telegramId }, include: { pet: true } });
  }

  async getById(id: number) {
    return prisma.user.findUnique({ where: { id }, include: { pet: true } });
  }

  async updateCoins(userId: number, delta: number, type: string, note?: string) {
    return prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { coins: { increment: delta } },
      });
      await tx.transaction.create({ data: { userId, amount: delta, type, note } });
      return user;
    });
  }

  async updateLoginStreak(userId: number, streakDays: number, lastLoginAt: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: { streakDays, lastLoginAt },
    });
  }
}
