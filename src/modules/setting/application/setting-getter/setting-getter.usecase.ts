import { SettingsRepository } from '@modules/setting/domain/repositories/settings.repository';
import { Inject, Injectable } from '@nestjs/common';
import { SettingGetterInput } from './setting-getter.input';

@Injectable()
export class SettingGetterUseCase {
  constructor(
    @Inject('SettingRepository')
    private readonly settingRepository: SettingsRepository,
  ) {}

  async execute(input: SettingGetterInput): Promise<string> {
    const setting = await this.settingRepository.get(input.userId, input.key);
    return setting.value;
  }
}
