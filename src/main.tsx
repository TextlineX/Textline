import React from 'react'
import ReactDOM from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { App } from './App'
import './styles/global.less'

gsap.registerPlugin(ScrollTrigger)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
