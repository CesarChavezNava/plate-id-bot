import { Module } from '@nestjs/common';
import { ProfileModule } from '@modules/profile/profile.module';
import { PhotoAnalizerAgent } from '@agents/photo-analyzer/photo-analyzer.agent';
import { FindProfileTool } from '@tools/find-profile.tool';
import { ImageAnalyzerTool } from '@tools/image-analyzer.tool';
import { OCRMenuExtractorTool } from '@tools/ocr-menu-extractor.tool';
import { RegisterFoodScoreTool } from '@tools/register-food-score.tool';
import { FoodRaterAgent } from './food-rater/food-rater.agent';
import { MetaAgent } from './meta/meta.agent';

@Module({
  imports: [ProfileModule],
  providers: [
    PhotoAnalizerAgent,
    FoodRaterAgent,
    MetaAgent,
    FindProfileTool,
    ImageAnalyzerTool,
    OCRMenuExtractorTool,
    RegisterFoodScoreTool,
  ],
  exports: [MetaAgent, PhotoAnalizerAgent],
})
export class AgentModule {}
