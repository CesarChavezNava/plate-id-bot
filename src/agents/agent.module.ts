import { Module } from '@nestjs/common';
import { ProfileModule } from '@modules/profile/profile.module';
import { FoodMenuAnalyzerAgent } from './food-menu-analyzer/food-menu-analyzer.agent';
import { DishRecognizerAgent } from './dish-recognizer/dish-recognizer.agent';
import { PhotoAnalizerAgent } from './photo-analyzer/photo-analyzer.agent';
import { FindProfileTool } from '@tools/find-profile.tool';
import { ImageAnalyzerTool } from '@tools/image-analyzer.tool';
import { OCRMenuExtractorTool } from '@tools/ocr-menu-extractor.tool';

@Module({
  imports: [ProfileModule],
  providers: [
    FoodMenuAnalyzerAgent,
    DishRecognizerAgent,
    PhotoAnalizerAgent,
    FindProfileTool,
    ImageAnalyzerTool,
    OCRMenuExtractorTool,
  ],
  exports: [FoodMenuAnalyzerAgent, DishRecognizerAgent, PhotoAnalizerAgent],
})
export class AgentModule {}
