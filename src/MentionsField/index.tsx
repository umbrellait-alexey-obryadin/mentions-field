import React, {
  useState,
  useRef,
  useCallback,
  FC,
  useMemo,
  useEffect
} from 'react'

import {
  InputProps,
  IRaw,
  MentionsFieldProps,
  MentionTag,
  Option
} from './types'
import './styles.css'

const MentionsField: FC<MentionsFieldProps> = ({
  options,
  disabled,
  label,
  className,
  isTextarea = false,
  onChange,
  tag = '@',
  value = '',
  ...props
}) => {
  const [inputText, setInputText] = useState<string>('')
  const [mentions, setMentions] = useState<MentionTag[]>([])
  const [suggestions, setSuggestions] = useState<Option[]>([])
  const [suggestionPosition, setSuggestionPosition] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const showMentionSuggestions = useCallback(
    (query: string) => {
      const filtered = options.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
      if (!filtered.length) {
        setSuggestions([])
      } else {
        setSuggestions(filtered)
      }
    },
    [options]
  )

  const checkForMentionTrigger = useCallback(
    (text: string, cursorPos: number) => {
      const textBeforeCursor = text.substring(0, cursorPos)
      const lastAtPos = textBeforeCursor.lastIndexOf(tag)

      const check1 = lastAtPos >= 0
      const check2 = lastAtPos === 0 || textBeforeCursor[lastAtPos - 1] === ' '
      const check3 = !mentions.some(
        (m) => lastAtPos >= m.start && lastAtPos < m.end
      )

      if (check1 && check2 && check3) {
        const mentionQuery = textBeforeCursor.substring(lastAtPos + 1)
        setSuggestionPosition(lastAtPos)
        showMentionSuggestions(mentionQuery)
      } else {
        setSuggestions([])
      }
    },
    [mentions, showMentionSuggestions, tag]
  )

  const handleTextDeletion = useCallback(
    (newText: string, cursorPos: number) => {
      const removedMentions = mentions.filter((mention) => {
        const deletedLength = inputText.length - newText.length
        const deletionStart = cursorPos
        const deletionEnd = cursorPos + deletedLength

        return (
          (mention.start >= deletionStart && mention.start < deletionEnd) ||
          (mention.end > deletionStart && mention.end <= deletionEnd) ||
          (mention.start <= deletionStart && mention.end >= deletionEnd)
        )
      })

      if (removedMentions.length > 0) {
        const newMentions = mentions.filter((m) => !removedMentions.includes(m))
        setMentions(newMentions)

        let cleanText = newText
        removedMentions.forEach((mention) => {
          cleanText =
            cleanText.substring(0, mention.start) +
            cleanText.substring(mention.end)
        })

        setInputText(cleanText)
      } else {
        setInputText(newText)
        checkForMentionTrigger(newText, cursorPos)
      }
    },
    [mentions, inputText.length, checkForMentionTrigger]
  )

  const handleInputChange = useCallback(
    (newText: string, cursorPos: number) => {
      if (newText.length < inputText.length) {
        handleTextDeletion(newText, cursorPos)
        return
      }

      setInputText(newText)
      checkForMentionTrigger(newText, cursorPos)
    },
    [checkForMentionTrigger, handleTextDeletion, inputText.length]
  )

  const prepareDraftMention = useCallback(
    (item: Option) => `${tag}[${item.value}](${item.label})`,
    [tag]
  )

  const prepareDisplayMention = useCallback(
    (item: Option) => `${tag}${item.label}`,
    [tag]
  )

  const handleSelectMention = useCallback(
    (item: Option) => {
      const mentionText = prepareDisplayMention(item)
      const textBefore = inputText.substring(0, suggestionPosition)
      const textAfter = inputText.substring(suggestionPosition + 1)

      const newText = `${textBefore}${mentionText} ${textAfter}`
      setInputText(newText)

      const newMention: MentionTag = {
        value: item.value,
        label: item.label,
        start: suggestionPosition,
        end: suggestionPosition + mentionText.length
      }

      setMentions([...mentions, newMention])
      setSuggestions([])

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          const newCursorPos = suggestionPosition + mentionText.length + 1
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    },
    [inputText, mentions, suggestionPosition, prepareDisplayMention]
  )

  const getRawResult = useCallback((): IRaw => {
    let draftText = inputText

    let offset = 0

    const sortedMentions = [...mentions].sort((a, b) => a.start - b.start)

    sortedMentions.forEach((mention) => {
      const mentionTag = prepareDraftMention(mention)
      const mentionLength = mention.end - mention.start

      draftText =
        draftText.substring(0, mention.start + offset) +
        mentionTag +
        draftText.substring(mention.end + offset)

      offset += mentionTag.length - mentionLength
    })

    return {
      displayText: inputText,
      draftText,
      mentions: sortedMentions.map((m) => ({
        label: m.label,
        value: m.value
      }))
    }
  }, [inputText, mentions, prepareDraftMention])

  const inputProps: InputProps = useMemo(
    () => ({
      ...props,
      ref: inputRef,
      onChange: (e) =>
        handleInputChange(e.target.value, e.target.selectionStart || 0),
      value: inputText,
      className: 'mentions-field__input',
      id: 'mentions-field-input',
      type: 'text'
    }),
    [handleInputChange, inputText, props]
  )

  const parseMentions = useCallback(
    (text: string): MentionTag[] => {
      const escapedTag = tag.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      const mentionRegex = new RegExp(
        `${escapedTag}\\[([^\\]]+)\\]\\(([^)]+)\\)`,
        'g'
      )
      const mentions: MentionTag[] = []
      let match

      while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push({
          value: match[1],
          label: match[2],
          start: match.index,
          end: match.index + match[0].length
        })
      }

      return mentions
    },
    [tag]
  )

  const component = useMemo(() => {
    if (isTextarea) {
      return <textarea {...inputProps} />
    }

    return <input {...inputProps} />
  }, [inputProps, isTextarea])

  useEffect(() => {
    if (onChange) {
      onChange(getRawResult())
    }
  }, [inputText, onChange, getRawResult])

  useEffect(() => {
    if (!value) return

    const newMentions = parseMentions(value)

    const displayText = newMentions.reduce((acc, mention) => {
      const mentionPattern = prepareDraftMention(mention)
      const displayMention = prepareDisplayMention(mention)
      const newStr = acc.replace(mentionPattern, displayMention)
      acc = newStr

      return acc
    }, value)

    const newMentions2 = newMentions.map((mention) => ({
      ...mention,
      start: displayText.indexOf(`${tag}${mention.label}`, mention.start),
      end:
        displayText.indexOf(`${tag}${mention.label}`, mention.start) +
        `${tag}${mention.label}`.length
    }))

    setInputText(displayText)
    setMentions(newMentions2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className={`mentions-field ${className || ''}`}>
      {label && (
        <label htmlFor="mentions-field-input" className="mentions-field__label">
          {label}
        </label>
      )}

      {component}

      {suggestions.length > 0 && (
        <div className="mentions-field__portal">
          <ul className="mentions-field__suggestions">
            {suggestions.map((item) => (
              <li
                key={item.value}
                className="mentions-field__suggestion"
                onClick={() => handleSelectMention(item)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default MentionsField
