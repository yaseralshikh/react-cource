export type User = {
  id: number;
  name: string;
  email: string;
  gender?: 'male' | 'female';
};

import { sqliteUsers } from '../sqlite/db';

export const userService = {
  async list(): Promise<User[]> {
    return sqliteUsers.list();
  },
  async create(payload: Omit<User, 'id'>): Promise<User> {
    return sqliteUsers.create(payload);
  },
  async update(id: number, patch: Partial<Omit<User, 'id'>>): Promise<User> {
    return sqliteUsers.update(id, patch);
  },
  async remove(id: number): Promise<void> {
    return sqliteUsers.remove(id);
  },
};

