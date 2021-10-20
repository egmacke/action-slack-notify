class SlackAction {
  public static parseTargets(targetInput: string): string[] {
    return targetInput.split("/n").map((target) => target.trim());
  }

  constructor(private slackTargets: string[], private message: string) {}
}
