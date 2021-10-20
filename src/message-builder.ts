import { setFailed } from "@actions/core";
import * as fs from "fs";

type ContentType = string | Record<string, any>;

class MessageBuilder {
  public static build(contentInput: string, templatePath?: string): string {
    const content = MessageBuilder.parseContent(templatePath, contentInput);
    let message: string;

    if (templatePath) {
      const template = MessageBuilder.loadTemplate(templatePath);
      message = MessageBuilder.populateTemplate(
        template,
        content as Record<string, any>
      );
    } else {
      message = contentInput;
    }

    return message;
  }

  private static parseContent(
    template: string | undefined,
    contentInput: string
  ) {
    let content: string | Record<string, any>;
    if (template) {
      try {
        content = JSON.parse(contentInput) as Record<string, any>;
      } catch (e) {
        setFailed(
          "Expected content as a JSON object when template is provided"
        );
        throw e;
      }
    } else {
      content = contentInput;
    }
    return content;
  }

  private static loadTemplate(templatePath: string): string {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Tempalte file '${templatePath}' not found`);
    }

    if (!fs.lstatSync(templatePath).isFile()) {
      throw new Error(`'${templatePath}' is not a file.`);
    }

    return fs.readFileSync(templatePath, { encoding: "utf8" });
  }

  public static populateTemplate(
    template: string,
    content: Record<string, any>,
    level: number = 0
  ): string {
    const indent = " ".repeat(level * 2);
    let message = template;
    Object.keys(content).forEach((key) => {
      const value = content[key];
      if (Array.isArray(value)) {
        const regex = new RegExp(` *{{ *${key}(?: (.*))?}}`, "g");
        if (value.every((v) => typeof v === "string")) {
          // Array of strings, print as is.
          message = message.replace(
            regex,
            content[key].map((v) => `\n${indent}- ${v}`).join("")
          );
        } else {
          const matches = message.matchAll(regex);
          for (const match of matches) {
            const placeholder = match[0];
            const innerTemplate = match[1];
            if (!innerTemplate) {
              // No template for list items
              // Replace with JSON.stringify bullet list
              message = message.replace(
                placeholder,
                content[key]
                  .map((v) => `\n${indent}- ${JSON.stringify(v)}`)
                  .join("")
              );
            } else {
              // Use provided list template
              message = message.replace(
                placeholder,
                content[key]
                  .map(
                    (v) =>
                      `\n${indent}- ${MessageBuilder.populateTemplate(
                        innerTemplate,
                        v,
                        level + 1
                      )}`
                  )
                  .join("")
              );
            }
          }
        }
      } else {
        const regex = new RegExp(`{{ *${key} *}}`, "g");
        message = message.replace(regex, content[key]);
      }
    });

    return message;
  }
}

export { ContentType, MessageBuilder };
