import React from 'react'

export interface Option {
  label: string
  value: string
}

export interface MentionTag extends Option {
  start: number
  end: number
}

type ChangeCbEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export interface InputProps
  extends Partial<Pick<HTMLTextAreaElement, 'cols' | 'rows'>>,
    Partial<
      Pick<
        HTMLInputElement,
        'placeholder' | 'disabled' | 'className' | 'id' | 'value'
      >
    > {
  onChange: (e: ChangeCbEvent) => void
}

export interface IRaw {
  displayText: string
  draftText: string
  mentions: Option[]
}

export interface MentionsFieldProps
  extends Partial<Omit<HTMLTextAreaElement, 'cols' | 'rows'>> {
  /**
   * The value of the input.
   * Example value: Some @[tag-value](Tag label) text
   */
  value?: string
  options: Option[]
  onChange?: (obj: IRaw) => void
  isTextarea?: boolean
  label?: string
  tag?: string
}
