import { extractText } from '.'

describe('extractText', () => {
  it('should extract text from well-formed HTML', () => {
    const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://static-production.npmjs.com/styles.74f9073cf68d3c5f4990.css" />
    <title data-react-helmet="true">extracttext - npm search</title>
    <style>
      p {
        color: #26b72b;
      }
    </style>
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
    expect(extracted).toBe('Some Title Some text')
  })
  it('should extract text from mal-formed HTML', () => {
    const html = `
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://static-production.npmjs.com/styles.74f9073cf68d3c5f4990.css" />
      Should not include
    </head>
    <noscript>
      <!-- anchor linking to external file -->
      <a href="https://www.mozilla.org/">External Link</a>
    </noscript>
    <style>
      p {
        color: #26b72b;
      }
    </style>
    <meta http-equiv="refresh" content="3;url=https://www.mozilla.org" />
    <TITLE data-react-helmet="true">extracttext - npm search</TITLE>
    <!-- Some comment -->
    <h1>Some Title</h1>
    <div style="font-weight: bold">Some   text</div>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/minicssextractbug.536095f4b1a94d2b149c.js"></script>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/search/search.9fbe393f02970084bce5.js"></script>
    <script>
      const FOO = 'bar'
    </script>
    `
    const extracted = extractText(html)
    expect(extracted).toBe('Some Title Some text')
  })
  it('should handle custom excludeContentFromTags', () => {
    const html = `
    <div>
      <div>Exclude</div>me
    </div>
    <p>Include me</p>
    `
    const extracted = extractText(html, { excludeContentFromTags: ['div'] })
    expect(extracted).toBe('Include me')
  })
  it('should replace tags with text and not trim whitespace', () => {
    const html = `<b>bold <span>text</span></b>
<div>some text</div><br /><br>
<p>more text</p>`
    const extracted = extractText(html, {
      preserveWhitespace: true,
      replacements: [
        { matchTag: 'br', text: '\n', isSelfClosing: true },
        { matchTag: 'b', text: '__' },
      ],
    })
    expect(extracted).toBe(`__bold text__
some text


more text`)
  })
})
