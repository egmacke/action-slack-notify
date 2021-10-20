import { error, getInput, setFailed } from "@actions/core";
import { MessageBuilder } from "src/message-builder";

(async () => {
  // Read input values
  const slackTarget = getInput("slack-target", { required: true });
  const content = getInput("content", { required: true });
  const templateFile = getInput("template", { required: false });

  // Parse input
  try {
    const targets = SlackAction.parseTargets(slackTarget);
    const message = MessageBuilder.build(content, templateFile);

    new SlackAction(targets, message);
  } catch (e) {
    error(e);
    setFailed(e);
  }

  // Switch on template
  // none
  // send plain message
  // template
  // populate template
  // send templated message
})();
