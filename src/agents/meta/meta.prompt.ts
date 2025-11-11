export const Prompts = {
  value: (lastMessage: any) =>
    `Clasifica la siguiente consulta del usuario a uno de los siguientes agentes: 
    'foodRater' (si es una calificación o feedback de comida), 
    'photoAnalyzer' (si hay una imagen adjunta), o 
    'defaultResponse' (para todo lo demás).

    Tu respuesta DEBE ser un objeto JSON que contenga solo la clave 'nextAgent'.
    
    Ejemplo de respuesta:
    { "nextAgent": "foodRater" }

    Consulta: ${lastMessage.content}`,
};
