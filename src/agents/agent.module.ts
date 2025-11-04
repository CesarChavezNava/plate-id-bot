import { Module } from '@nestjs/common';
import { ProfileModule } from '@modules/profile/profile.module';
import { PhotoAnalizerAgent } from '@agents/photo-analyzer/photo-analyzer.agent';
import { FindProfileTool } from '@tools/find-profile.tool';
import { ImageAnalyzerTool } from '@tools/image-analyzer.tool';
import { OCRMenuExtractorTool } from '@tools/ocr-menu-extractor.tool';

@Module({
  imports: [ProfileModule],
  providers: [
    PhotoAnalizerAgent,
    FindProfileTool,
    ImageAnalyzerTool,
    OCRMenuExtractorTool,
  ],
  exports: [PhotoAnalizerAgent],
})
export class AgentModule {}
