import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AgentModule } from '@agents/agent.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { StartUpdate } from './handlers/start.update';
import { RegisterUpdate } from './handlers/register.update';
import { HelpUpdate } from './handlers/help.update';
import { LikeUpdate } from './handlers/like.update';
import { DislikeUpdate } from './handlers/dislike.update';
import { AllergyUpdate } from './handlers/allergy.update';
import { ListUpdate } from './handlers/list.update';
import { PhotoUpdate } from './handlers/photo.update';

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
    AgentModule,
  ],
  providers: [
    StartUpdate,
    HelpUpdate,
    RegisterUpdate,
    LikeUpdate,
    DislikeUpdate,
    AllergyUpdate,
    ListUpdate,
    PhotoUpdate,
  ],
  exports: [],
})
export class TelegramModule {}
