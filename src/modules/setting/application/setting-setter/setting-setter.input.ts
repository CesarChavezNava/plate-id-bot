export class SettingSetterInput {
  constructor(
    public readonly userId: string,
    public readonly key: string,
    public readonly value: string,
  ) {}
}
