import { isMatch } from 'lodash'
import * as htmlparser2 from 'htmlparser2'
import _debug from 'debug'

const debug = _debug('extract-text-html')

export interface Replacement {
  /** Tag name to match (without brackets) */
  matchTag: string
  /** Attributes to match */
  matchAttrs?: Record<string, string>
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
 */
export const extractText = (html: string, options: Options = {}) => {
  // Options
  const excludeTags =
    options.excludeContentFromTags ?? defaultExcludeContentFromTags
  const trimWhitespace = options.trimWhitespace ?? true
  const replacements = options.replacements ?? []

  let excludeText = false
  let strippedText = ''
  let replacement: Replacement | undefined

  const shouldExclude = (name: string) => excludeTags.includes(name)

  const findReplacement = (name: string, attrs: Record<string, string> = {}) =>
    replacements.find(({ matchTag, matchAttrs }) => {
      if (matchTag === name) {
        if (matchAttrs) {
          return isMatch(attrs, matchAttrs)
        }
        return true
      }
    })

  const parser = new htmlparser2.Parser({
    onopentag(name, attrs) {
      debug('open tag name %s', name)
      if (shouldExclude(name)) {
        excludeText = true
      }
      replacement = findReplacement(name, attrs)
      if (options.replacements && replacement) {
        debug('replace open tag %s with attrs %o', name, attrs)
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
