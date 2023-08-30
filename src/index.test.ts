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
  </head>
  <body>
    <h1>Some Title</h1>
    <div style="font-weight: bold">Some text</div>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/minicssextractbug.536095f4b1a94d2b149c.js"></script>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/search/search.9fbe393f02970084bce5.js"></script>
  </body>
</html>
    `
    const extracted = extractText(html)
    expect(extracted).toBe('Some Title Some text')
  })
  it('should extract text from mal-formed HTML', () => {
    const html = `
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://static-production.npmjs.com/styles.74f9073cf68d3c5f4990.css" />
    <title data-react-helmet="true">extracttext - npm search</title>
    <h1>Some Title</h1>
    <div style="font-weight: bold">Some text</div>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/minicssextractbug.536095f4b1a94d2b149c.js"></script>
    <script crossorigin="anonymous" src="https://static-production.npmjs.com/search/search.9fbe393f02970084bce5.js"></script>
    `
    const extracted = extractText(html)
    expect(extracted).toBe('Some Title Some text')
  })
})
