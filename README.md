# action-slack-notify

Github Action to send templated notifications to slack

# Example use

A simple use case sending a single line message to a channel

```yml
steps:
  - name: Slack
    uses: egmacke/action-slack-notify@v1
    with:
      slack-target: C02K46H34QG
      content: This is a test message
```

Sending a multiline message to multiple users

```yml
steps:
  - name: Slack
    uses: egmacke/action-slack-notify@v1
    with:
      slack-target: |
        U01G1EQxxxx
        U01G1EQyyyy
      content: |
        > This is a _formatted_ message for *slack*
        Sent with multiple lines
        - And a list
        - with two entries
```

Sending a templated message

```yml
steps:
  - name: Slack
    uses: egmacke/action-slack-notify@v1
    with:
      slack-target: U01G1EQyyyy
      template: ".github/slack-template"
      content: |
        {
          title: "Template message",
          comment: "This is a comment",
          list: [
            "item1",
            "item2"
          ],
          complexList: [
            { prefix: "hello", name: "Alice" },
            { prefix: "goodbye", name: "Alice" }
          ]
        }
```

```
{{title}}
> {{comment}}
{{list}}
{{complexList 'item template - {{prefix}} {{name}}'}}
```

# Template Syntax

The template syntax uses `{{...}}` to mark placeholders. These placeholders are mapped directly to keys in the `content` input field, which should be structured as a JSON object.

## Lists

Where the `content` object defines a value as a primative list, this list will be expanded as a simple bulleted list using slack's markdown.

For example the action input of

```yml
content: |
  key: ['item1', 'item2']
```

with the following template

```
{{key}}
```

would result in the following slack markdown

```
- item1
- item2
```

## Complex Lists

Where the `content` object defines a value as an object list, this list will be expanded as a markdown list, where each entry in the list uses the additional template provided

For example the action input of

```yml
content: |
  key: [
    {prefix: 'item1', label: 'something'}, 
    {prefix: 'item2', label: 'something else'}
  ]
```

with the following template

```
{{key '*{{prefix}}*: {{label}}'}}
```

would result in the following slack markdown

```
- *item1*: something
- *item2*: something else
```

Where no list template is provided, the complex item will be printed using `JSON.stringify`
