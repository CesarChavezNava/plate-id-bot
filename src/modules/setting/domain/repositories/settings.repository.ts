import { Setting } from '../entities/setting';

export interface SettingsRepository {
  set(userId: string, setting: Setting): Promise<void>;
  get(userId: string, key: string): Promise<Setting>;
}
