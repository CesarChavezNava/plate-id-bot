import { Module } from '@nestjs/common';
import { ProfileModule } from '@modules/profile/profile.module';
import { FoodMenuAnalyzerAgent } from './food-menu-analyzer/food-menu-analyzer.agent';
import { DishRecognizerAgent } from './dish-recognizer/dish-recognizer.agent';

@Module({
  imports: [ProfileModule],
  providers: [FoodMenuAnalyzerAgent, DishRecognizerAgent],
  exports: [FoodMenuAnalyzerAgent, DishRecognizerAgent],
})
export class AgentModule {}
