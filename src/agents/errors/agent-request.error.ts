export class AgentRequestError extends Error {
  constructor() {
    super('An agent error occurred while processing your request.');
  }
}
