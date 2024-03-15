import * as htmlparser2 from 'htmlparser2'
import _debug from 'debug'

const debug = _debug('extract-text-html')

export interface Replacement {
  /** Tag name to match (without brackets) */
  matchTag: string
  /** Text to replace the tag with */
  text: string
  /** Is the tag self-closing?  */
  selfClosing?: boolean
}

export interface Options {
  /** Exclude the content from the set of tags. For example, style and script. */
  excludeContentFromTags?: string[]
  /** Reduces multiple spaces to a single space and trims whitespace from the start and end. */
  trimWhitespace?: boolean
  /** Replace a tag with some text. Flag self-closing tags with selfClosing: true. */
  replacements?: Replacement[]
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
 * Optionally, replace tags with text.
 */
export const extractText = (html: string, options: Options = {}) => {
  // Options
  const excludeTags =
    options.excludeContentFromTags ?? defaultExcludeContentFromTags
  const trimWhitespace = options.trimWhitespace ?? true
  const replacements = options.replacements ?? []

  let excludeText = false
  let strippedText = ''

  const shouldExclude = (name: string) => excludeTags.includes(name)

  const findReplacement = (name: string) =>
    replacements.find(({ matchTag }) => matchTag === name)

  const parser = new htmlparser2.Parser({
    onopentagname(name) {
      debug('open tag name %s', name)
      if (shouldExclude(name)) {
        excludeText = true
      }
      const replacement = findReplacement(name)
      if (options.replacements && replacement) {
        debug('replace open tag %s with %s', name, replacement.text)
        strippedText += replacement.text
      }
    },
    ontext(text) {
      if (!excludeText) {
        strippedText += text
      }
    },
    onclosetag(name) {
      debug('close tag name %s', name)
      if (shouldExclude(name)) {
        excludeText = false
      }
      const replacement = findReplacement(name)
      if (options.replacements && replacement && !replacement.selfClosing) {
        debug('replace close tag %s with %s', name, replacement.text)
        strippedText += replacement.text
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
