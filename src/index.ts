import * as htmlparser2 from 'htmlparser2'

type Options = {
  /** Exclude the content from the set of tags. For example, style and script. */
  excludeContentFromTags?: string[]
  /** Reduces multiple spaces to a single space and trims whitespace from the start and end. */
  trimWhitespace?: boolean
}

// Exclude content from metadata tags.
// https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#metadata_content
export const defaultExcludeContentFromTags = [
  'head',
  'base',
  'link',
  'meta',
  'noscript',
  'script',
  'style',
  'title',
]

/**
 * Extract text from HTML. Excludes content from metadata tags by default.
 * For example, script and style. Removes excess whitespace by default.
 */
export const extractText = (html: string, options: Options = {}) => {
  // Options
  const excludeTags =
    options.excludeContentFromTags ?? defaultExcludeContentFromTags
  const trimWhitespace = options.trimWhitespace ?? true

  let excludeText = false
  let strippedText = ''

  const shouldExclude = (name: string) => excludeTags.includes(name)

  const parser = new htmlparser2.Parser({
    onopentagname(name) {
      if (shouldExclude(name)) {
        excludeText = true
      }
    },
    ontext(text) {
      if (!excludeText) {
        strippedText += text
      }
    },
    onclosetag(name) {
      if (shouldExclude(name)) {
        excludeText = false
      }
    },
  })
  parser.write(html)
  parser.end()

  // Remove excess whitespace if needed
  return trimWhitespace
    ? strippedText.replace(/\s+/g, ' ').trim()
    : strippedText
}
