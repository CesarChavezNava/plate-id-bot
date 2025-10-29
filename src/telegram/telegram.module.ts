import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AgentModule } from '@agents/agent.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { StartUpdate } from './handlers/start.update';
import { RegisterUpdate } from './handlers/register.update';
import { HelpUpdate } from './handlers/help.update';
import { AllergyUpdate } from './handlers/allergy.update';
import { ListUpdate } from './handlers/list.update';
import { PhotoUpdate } from './handlers/photo.update';
import { FoodUpdate } from './handlers/food.update';
import { LanguageUpdate } from './handlers/language.update';
import { SettingModule } from '@modules/setting/setting.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        token: process.env.TELEGRAM_TOKEN,
      }),
    }),
    AuthModule,
    ProfileModule,
    SettingModule,
    AgentModule,
  ],
  providers: [
    StartUpdate,
    HelpUpdate,
    RegisterUpdate,
    AllergyUpdate,
    FoodUpdate,
    ListUpdate,
    LanguageUpdate,
    PhotoUpdate,
  ],
  exports: [],
})
export class TelegramModule {}
