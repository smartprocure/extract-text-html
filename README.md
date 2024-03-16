# extract-text-html

Extract text from HTML. Excludes content from metadata tags by default.
For example, script and style. Reduces multiple spaces to a single space
and trims whitespace from the start and end by default. Set `preserveWhitespace`
to `true` to disable this behavior. Optionally, replace tags with text.

Single dependency on [htmlparser2](https://www.npmjs.com/package/htmlparser2)

```typescript
export interface Replacement {
    /** Tag name to match (without brackets) */
    matchTag: string
    /** Text to replace the tag with */
    text: string
    /** Is the tag self-closing?  */
    isSelfClosing?: boolean
}

export interface Options {
    /** Exclude the content from the set of tags. For example, style and script. */
    excludeContentFromTags?: string[]
    /** Whitespace is trimmed by default. Set this to true to preserve whitespace. */
    preserveWhitespace?: boolean
    /** Replace a tag with some text. Flag self-closing tags with isSelfClosing: true. */
    replacements?: Replacement[]
}
```

## Example

```typescript
import { extractText } from 'extract-text-html'

const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://static-production.npmjs.com/styles.74f9073cf68d3c5f4990.css" />
    <title data-react-helmet="true">extracttext - npm search</title>
  </head>
  <body>
    <h1>Some Title</h1>
    <div style="font-weight: bold">Some text</div>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/minicssextractbug.536095f4b1a94d2b149c.js"></script>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/search/search.9fbe393f02970084bce5.js"></script>
    <script>
      const FOO = 'bar'
    </script>
    <br />
    <br />
  </body>
</html>
    `
const extracted = extractText(html)
// Some Title Some text
```

Replacements example usage

```typescript
const html = `<b>bold <span>text</span></b>
<div>some text</div>
<br />
<br>
<p>more text</p>`
const extracted = extractText(html, {
    preserveWhitespace: true,
    replacements: [
        { matchTag: 'br', text: '  ', isSelfClosing: true },
        { matchTag: 'b', text: '__' },
    ],
})
/*
__bold text__
some text
  
  
more text
*/
```
