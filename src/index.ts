import * as htmlparser2 from 'htmlparser2'
import _debug from 'debug'

const debug = _debug('extract-text-html')

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

const newStack = <T>() => {
  const stack: T[] = []
  const add = (item: T) => {
    stack.push(item)
    return stack.length
  }
  const remove = () => {
    stack.pop()
    return stack.length
  }
  const isEmpty = () => stack.length === 0
  return { add, remove, isEmpty }
}

/**
 * Extract text from HTML. Excludes content from metadata tags by default.
 * For example, script and style. Reduces multiple spaces to a single space
 * and trims whitespace from the start and end by default. Set `preserveWhitespace`
 * to `true` to disable this behavior. Optionally, replace tags with text.
 */
export const extractText = (html: string, options: Options = {}) => {
  // Options
  const excludeTags =
    options.excludeContentFromTags ?? defaultExcludeContentFromTags
  const replacements = options.replacements ?? []

  const excludeStack = newStack<string>()
  let strippedText = ''

  const shouldExclude = (name: string) => excludeTags.includes(name)

  const findReplacement = (name: string) =>
    replacements.find(({ matchTag }) => matchTag === name)

  const parser = new htmlparser2.Parser({
    onopentagname(name) {
      debug('open tag name %s', name)
      if (shouldExclude(name) && excludeStack.add(name) === 1) {
        debug('start excluding')
      }
      if (options.replacements) {
        const replacement = findReplacement(name)
        if (replacement) {
          debug('replace open tag %s with %s', name, replacement.text)
          strippedText += replacement.text
        }
      }
    },
    ontext(text) {
      if (excludeStack.isEmpty()) {
        strippedText += text
      }
    },
    onclosetag(name) {
      debug('close tag name %s', name)
      if (shouldExclude(name) && excludeStack.remove() === 0) {
        debug('stop excluding')
      }
      if (options.replacements) {
        const replacement = findReplacement(name)
        if (replacement && !replacement.isSelfClosing) {
          debug('replace close tag %s with %s', name, replacement.text)
          strippedText += replacement.text
        }
      }
    },
  })
  parser.write(html)
  parser.end()

  return options.preserveWhitespace
    ? strippedText
    : // Remove excess whitespace
      strippedText.replace(/\s+/g, ' ').trim()
}
