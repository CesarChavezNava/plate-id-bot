import { SettingsRepository } from '@modules/setting/domain/repositories/settings.repository';
import { Inject, Injectable } from '@nestjs/common';
import { SettingSetterInput } from './setting-setter.input';
import { Setting } from '@modules/setting/domain/entities/setting';

@Injectable()
export class SettingSetterUseCase {
  constructor(
    @Inject('SettingRepository')
    private readonly settingRepository: SettingsRepository,
  ) {}

  async execute(input: SettingSetterInput): Promise<void> {
    await this.settingRepository.set(
      input.userId,
      new Setting(input.key, input.value),
    );
  }
}
