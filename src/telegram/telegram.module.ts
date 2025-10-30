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
import {
  TelegrafI18nModule,
  TelegrafI18nMiddlewareProvider,
  TelegrafI18nContext,
} from 'nestjs-telegraf-i18n';

@Module({
  imports: [
    TelegrafI18nModule,
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      inject: [TelegrafI18nMiddlewareProvider],
      imports: [ConfigModule],
      useFactory: (
        telegrafI18nMiddlewareProvider: TelegrafI18nMiddlewareProvider,
      ) => ({
        token: process.env.TELEGRAM_TOKEN,
        options: {
          contextType: TelegrafI18nContext,
        },
        middlewares: [telegrafI18nMiddlewareProvider.telegrafI18nMiddleware],
      }),
    }),
    AuthModule,
    ProfileModule,
    AgentModule,
  ],
  providers: [
    StartUpdate,
    HelpUpdate,
    RegisterUpdate,
    AllergyUpdate,
    FoodUpdate,
    ListUpdate,
    PhotoUpdate,
  ],
  exports: [],
})
export class TelegramModule {}
