export class NoResponseFromAgentError extends Error {
  constructor() {
    super('No response from agent');
  }
}
