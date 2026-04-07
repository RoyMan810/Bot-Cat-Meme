import { env } from '../config/env';
import { logger } from '../config/logger';
import { PetRepository } from '../repositories/pet-repository';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function startStatDecayJob() {
  const petRepo = new PetRepository();

  setInterval(async () => {
    try {
      const pets = await petRepo.listAllPets();
      for (const pet of pets) {
        const hunger = clamp(pet.hunger - 6);
        const happiness = clamp(pet.happiness - 4);
        const energy = clamp(pet.energy - 5);
        const healthPenalty = hunger < 20 || energy < 20 ? 8 : 2;
        const health = clamp(pet.health - healthPenalty);

        const status: 'HEALTHY' | 'SICK' = health < 40 ? 'SICK' : 'HEALTHY';
        const ageIncrement =
          Date.now() - pet.lastDecayAt.getTime() > 24 * 60 * 60 * 1000 ? 1 : 0;

        await petRepo.updateStats(pet.id, {
          hunger,
          happiness,
          energy,
          health,
          status,
          ageDays: pet.ageDays + ageIncrement,
        });
      }
      logger.info({ count: pets.length }, 'Stat decay tick complete');
    } catch (error) {
      logger.error({ err: error }, 'Stat decay job failed');
    }
  }, env.decayIntervalMinutes * 60 * 1000);
}
