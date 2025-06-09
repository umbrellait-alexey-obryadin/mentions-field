import React from 'react'
import ReactDOM from 'react-dom/client'

import MentionsField from './MentionsField'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
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
    </React.StrictMode>
  )
}
