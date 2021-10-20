import { MessageBuilder } from "action/message-builder";

describe("MessageBuilder", () => {
  it("should return the content as the message when no template provided", () => {
    expect(MessageBuilder.build("This is a message")).toEqual(
      "This is a message"
    );
  });

  describe("populateTemplate", () => {
    it("should replace placeholders when variable names are defined", () => {
      const template = "This is a {{type}} message for {{name}}";
      const content = {
        type: "custom",
        name: "Bob",
      };
      const result = MessageBuilder.populateTemplate(template, content);

      expect(result).toEqual("This is a custom message for Bob");
    });

    it("should replace repeat placeholders when variable names are defined multiple times", () => {
      const template = "This is a {{type}} message for {{name}} {{name}}";
      const content = {
        type: "custom",
        name: "Bob",
      };
      const result = MessageBuilder.populateTemplate(template, content);

      expect(result).toEqual("This is a custom message for Bob Bob");
    });

    it("should replace list placeholders with a bullet list", () => {
      const template = "Some items: {{list}}";
      const content = {
        list: ["item1", "item2", "item3"],
      };
      const result = MessageBuilder.populateTemplate(template, content);

      expect(result).toEqual(`Some items:
- item1
- item2
- item3`);
    });

    it("should replace complex list placeholders with a bullet list of json strings when no inner template", () => {
      const template = "Some items: {{list}}";
      const content = {
        list: [
          { prefix: "item1", label: "something" },
          { prefix: "item2", label: "something else" },
        ],
      };
      const result = MessageBuilder.populateTemplate(template, content);

      expect(result).toEqual(`Some items:
- {"prefix":"item1","label":"something"}
- {"prefix":"item2","label":"something else"}`);
    });

    it("should replace complex list placeholders with a list of templated strings when inner template is provided", () => {
      const template = "Some items: {{list *{{prefix}}*: {{label}}}}";
      const content = {
        list: [
          { prefix: "item1", label: "something" },
          { prefix: "item2", label: "something else" },
        ],
      };
      const result = MessageBuilder.populateTemplate(template, content);

      expect(result).toEqual(`Some items:
- *item1*: something
- *item2*: something else`);
    });

    it("should replace complex list using local template", () => {
      const template = `Some items: {{list *{{prefix}}*: {{label}}}}
With some different formatting: {{list _{{prefix}}_: {{label}}}}`;
      const content = {
        list: [
          { prefix: "item1", label: "something" },
          { prefix: "item2", label: "something else" },
        ],
      };
      const result = MessageBuilder.populateTemplate(template, content);

      expect(result).toEqual(`Some items:
- *item1*: something
- *item2*: something else
With some different formatting:
- _item1_: something
- _item2_: something else`);
    });

    it("should recurse into complex list templates", () => {
      const template = `Some items: {{list *{{prefix}}*: {{label {{part1}} - {{part2}}}}}}`;
      const content = {
        list: [
          {
            prefix: "item1",
            label: [
              { part1: "Start1", part2: "End1" },
              { part1: "Start2", part2: "End2" },
            ],
          },
          { prefix: "item2", label: [] },
        ],
      };
      const result = MessageBuilder.populateTemplate(template, content);

      expect(result).toEqual(`Some items:
- *item1*:
  - Start1 - End1
  - Start2 - End2
- *item2*:`);
    });
  });
});
