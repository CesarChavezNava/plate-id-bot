import { Module } from '@nestjs/common';
import { PhotoRecognizerAgent } from './photo-recognizer.agent';
import { ProfileModule } from '@modules/profile/profile.module';

@Module({
  imports: [ProfileModule],
  providers: [PhotoRecognizerAgent],
  exports: [PhotoRecognizerAgent],
})
export class AgentModule {}
