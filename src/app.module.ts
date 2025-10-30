import * as path from 'path';

import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { I18nModule } from 'nestjs-i18n';

@Module({
  imports: [
    TelegramModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [],
    }),
  ],
})
export class AppModule {}
