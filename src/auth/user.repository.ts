import { User } from './entities/user.entity';
import { EntityRepository } from '@mikro-orm/mysql';

export class UserRepository extends EntityRepository<User> {
  // // 1. Find a user by email
  // async findByEmail(email: string): Promise<User | null> {
  //   return await this.findOne({ email });
  // }
  //
  // // 2. Find a user by username
  // async findByUsername(username: string): Promise<User | null> {
  //   return await this.findOne({ username });
  // }
  //
  // // 3. Find a user by ID or throw an error if not found
  // async findByIdOrFail(id: number): Promise<User> {
  //   return await this.findOneOrFail({ id });
  // }
  //
  // // 4. Create and persist a new user
  // async createUser(data: Partial<User>): Promise<User> {
  //   const user = this.create(data);
  //   await this.em.persistAndFlush(user);
  //   return user;
  // }
  //
  // // 5. Update a user's information
  // async updateUser(id: number, updates: Partial<User>): Promise<User> {
  //   const user = await this.findByIdOrFail(id);
  //   this.assign(user, updates);
  //   await this.em.flush();
  //   return user;
  // }
  //
  // // 6. Delete a user by ID
  // async deleteUser(id: number): Promise<void> {
  //   const user = await this.findByIdOrFail(id);
  //   await this.em.removeAndFlush(user);
  // }
  //
  // // 7. Count users by role
  // async countByRole(role: Role): Promise<number> {
  //   return await this.count({ role });
  // }
  //
  // // 8. Find all users with a specific role
  // async findAllByRole(role: Role): Promise<User[]> {
  //   return await this.find({ role });
  // }
  //
  // // 9. Find and count users with a specific role
  // async findAndCountByRole(role: Role): Promise<[User[], number]> {
  //   return await this.findAndCount({ role });
  // }
  //
  // // 10. Find users with pagination and sorting
  // async findUsersWithPagination(
  //   offset: number,
  //   limit: number,
  //   orderBy: { [key in keyof User]?: 'ASC' | 'DESC' } = { createdAt: 'DESC' },
  // ): Promise<User[]> {
  //   return await this.find({}, { offset, limit, orderBy });
  // }
  //
  // // 11. Find a user and populate contacts
  // async findByIdWithContacts(id: number): Promise<User | null> {
  //   return await this.findOne({ id }, { populate: ['contacts'] });
  // }
  //
  // // 12. Execute a native SQL query
  // async executeNativeQuery(sql: string, params: any[] = []): Promise<any[]> {
  //   return await this.getEntityManager().getConnection().execute(sql, params);
  // }
}
