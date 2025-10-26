export class MessageBuilder {
  static buildCompatibilityReplyMessage(response: string): string {
    const jsonResponse = JSON.parse(response);
    let replyMessage = '';
    if (jsonResponse.recognitionCode === 'RECOGNIZED' && jsonResponse.dish) {
      const dishName = jsonResponse.dish.name || 'un plato de comida';
      const compatibility = jsonResponse.analysis?.compatibility;

      let compatibilityText = '';

      if (compatibility !== undefined) {
        const emojiScore = this.getScoreWithEmojis(compatibility);
        compatibilityText = `\n\n**Compatibility with your Profile:** ${emojiScore}`;
      }

      replyMessage = `🍽️ **Dish name:** ${dishName}.${compatibilityText}`;
    } else if (jsonResponse.recognitionCode === 'MENU' && jsonResponse.dishes) {
      const recommendations = jsonResponse.analysis?.recommendations;

      replyMessage = `📋 **Identified Menu.**`;

      if (recommendations && recommendations.length) {
        const list = recommendations
          .map((recomendation, index) => `${index + 1}. ${recomendation}`)
          .join('\n');
        replyMessage += `\n\n**🏆 Top 5 Recommendations for You:**\n${list}`;
      } else {
        const dishNames = jsonResponse.dishes
          .map((dish) => dish.name)
          .slice(0, 5)
          .join(', ');
        replyMessage += `\nIdentified dishes: ${dishNames}.`;
      }
    } else {
      replyMessage = `⚠️🔍 **No individual dish or clear menu was found to analyze.**`;
    }

    return replyMessage;
  }

  private static getScoreWithEmojis(score: number): string {
    return '⭐'.repeat(Math.max(1, Math.min(5, Math.round(score))));
  }
}
