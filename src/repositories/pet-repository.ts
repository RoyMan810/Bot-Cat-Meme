import { prisma } from './prisma';

export class PetRepository {
  createStarterPet(userId: number) {
    return prisma.pet.create({ data: { userId } });
  }

  getByUserId(userId: number) {
    return prisma.pet.findUnique({ where: { userId } });
  }

  async updateStats(
    petId: number,
    updates: Partial<{ hunger: number; happiness: number; energy: number; health: number; xp: number; level: number; ageDays: number; status: 'HEALTHY' | 'SICK' }>,
  ) {
    return prisma.pet.update({ where: { id: petId }, data: updates });
  }

  listAllPets() {
    return prisma.pet.findMany();
  }
}
