import { ProfileFinderInput } from '@modules/profile/application/profile-finder/profile-finder.input';
import { ProfileFinderUseCase } from '@modules/profile/application/profile-finder/profile-finder.usecase';
import { Injectable } from '@nestjs/common';
import { Tool } from 'langchain';

@Injectable()
export class FindProfileTool extends Tool {
  public name = 'find_profile';
  public description =
    'Busca el perfil de preferencias y restricciones de comida del usuario. El input debe ser el ID de la sesión/usuario.';

  constructor(private readonly profileFinderUseCase: ProfileFinderUseCase) {
    super();
  }

  public async _call(userId: string): Promise<string> {
    const profile = await this.profileFinderUseCase.execute(
      new ProfileFinderInput(userId),
    );

    const foods = profile.food.map(
      (rating) => `Nombre: ${rating.food.name}, Score: ${rating.score}`,
    );
    const allergies = profile.allergies.map((allergy) => allergy.food.name);

    return `Datos de perfil del usuario:
    ---
    - Comidas y Puntuaciones (0 a 5): ${foods.join(', ') || 'Ninguna comida puntuanda.'}
    - Alergias Conocidas: ${allergies.join(', ') || 'Ninguna alergia registrada.'}
    ---`;
  }
}
