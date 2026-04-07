import { PetRepository } from '../repositories/pet-repository';
import { UserRepository } from '../repositories/user-repository';
import { ProgressionService } from './progression-service';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export class PetService {
  constructor(
    private readonly petRepo = new PetRepository(),
    private readonly userRepo = new UserRepository(),
    private readonly progression = new ProgressionService(),
  ) {}

  async ensurePet(userId: number) {
    const pet = await this.petRepo.getByUserId(userId);
    if (pet) return pet;
    return this.petRepo.createStarterPet(userId);
  }

  async feed(userId: number) {
    const pet = await this.ensurePet(userId);
    const result = this.progression.applyXp(pet.level, pet.xp, 8);
    const next = await this.petRepo.updateStats(pet.id, {
      hunger: clamp(pet.hunger + 20),
      health: clamp(pet.health + 3),
      xp: result.xp,
      level: result.level,
      status: 'HEALTHY',
    });
    await this.userRepo.updateCoins(userId, 5, 'reward', 'Feed action reward');
    return { pet: next, gainedXp: 8, gainedCoins: 5, leveledUp: result.leveledUp };
  }

  async play(userId: number) {
    const pet = await this.ensurePet(userId);
    const result = this.progression.applyXp(pet.level, pet.xp, 14);
    const next = await this.petRepo.updateStats(pet.id, {
      happiness: clamp(pet.happiness + 18),
      energy: clamp(pet.energy - 12),
      hunger: clamp(pet.hunger - 5),
      xp: result.xp,
      level: result.level,
    });
    await this.userRepo.updateCoins(userId, 8, 'reward', 'Play action reward');
    return { pet: next, gainedXp: 14, gainedCoins: 8, leveledUp: result.leveledUp };
  }

  async sleep(userId: number) {
    const pet = await this.ensurePet(userId);
    return this.petRepo.updateStats(pet.id, {
      energy: clamp(pet.energy + 25),
      health: clamp(pet.health + 2),
    });
  }

  async clean(userId: number) {
    const pet = await this.ensurePet(userId);
    return this.petRepo.updateStats(pet.id, {
      health: clamp(pet.health + 10),
      happiness: clamp(pet.happiness + 6),
    });
  }

  async heal(userId: number, cost = 30) {
    const user = await this.userRepo.getById(userId);
    if (!user) throw new Error('User not found');
    if (user.coins < cost) throw new Error('Недостаточно монет для лечения.');

    const pet = await this.ensurePet(user.id);
    const next = await this.petRepo.updateStats(pet.id, {
      health: clamp(pet.health + 35),
      status: 'HEALTHY',
    });
    await this.userRepo.updateCoins(user.id, -cost, 'purchase', 'Heal action');
    return next;
  }

  buildPetView(pet: {
    hunger: number;
    happiness: number;
    energy: number;
    health: number;
    level: number;
    xp: number;
    ageDays: number;
    status: 'HEALTHY' | 'SICK';
  }, coins: number) {
    const nextLevelXp = this.progression.xpForNextLevel(pet.level);
    return [
      `🐱 *Твоя котость*`,
      `🍗 Сытость: ${pet.hunger}/100`,
      `🎉 Счастье: ${pet.happiness}/100`,
      `⚡ Энергия: ${pet.energy}/100`,
      `❤️ Здоровье: ${pet.health}/100 (${pet.status})`,
      `⭐ Уровень: ${pet.level}`,
      `🧪 XP: ${pet.xp}/${nextLevelXp}`,
      `📅 Возраст: ${pet.ageDays} дн.`,
      `🪙 Монеты: ${coins}`,
    ].join('\n');
  }
}
