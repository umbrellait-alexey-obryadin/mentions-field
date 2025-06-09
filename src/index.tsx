import React from 'react'
import ReactDOM from 'react-dom/client'

import { MentionChangeValue, MentionsFieldProps, MentionOption } from './types'
import { MentionsField } from './MentionsField'

export * from './MentionsField'

export type { MentionChangeValue, MentionsFieldProps, MentionOption }

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>MentionsField</h1>
        <p>Для ввода тега по умолчанию используется @</p>
        <MentionsField
          onChange={console.log}
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
            { label: 'Option 3', value: 'option-3' },
            { label: 'Option 4', value: 'option-4' },
            { label: 'Option 5', value: 'option-5' }
          ]}
        />
      </div>
    </React.StrictMode>
  )
}
