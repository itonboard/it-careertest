import { NextButton } from '../Button'
import { Languages, useGlobalState } from '../../state'
import Slide, { ActiveHandler, SC } from './Slide'
import { useCallback, useRef } from 'react'

const text: Record<Languages, { text: JSX.Element, placeholder: string }> = {
  de: {
    text: <p>Hi! Wir werden mit dir deine Berufsinteressen in der IT herausfinden.<br/>Nenne uns bitte zunächst deinen
      Vornamen…</p>,
    placeholder: 'Dein Vorname…'
  },
  en: {
    text: <p>Hi. We will help you find your career interests in IT.<br/>First of all, please tell us your first
      name...</p>,
    placeholder: 'Your first name…'
  }
}

const FirstNameSlide: SC = ({ status }) => {
  const { decrementSlide, language, incrementSlide, firstName, setFirstName, infoModalOpen } = useGlobalState()
  const inputRef = useRef<HTMLInputElement>(null)

  const keyEventHandler = useCallback<ActiveHandler>(() => {
    if (inputRef.current != null) setTimeout(() => inputRef.current!.focus({ preventScroll: true }), 500)

    const callback = (event: KeyboardEvent) => {
      if (infoModalOpen) return
      if (event.key === 'Enter') {
        event.preventDefault()
        if ((inputRef.current?.value?.length ?? 0) === 0) return
        incrementSlide()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        decrementSlide()
      }
    }

    window.addEventListener('keydown', callback)

    return () => {
      if (inputRef.current != null) inputRef.current.blur()
      window.removeEventListener('keydown', callback)
    }
  }, [incrementSlide, decrementSlide, infoModalOpen])

  return (
    <Slide name="text-input" status={status} onActive={keyEventHandler}>
      <section className="slide-content">
        {text[language].text}
      </section>
      <section className="slide-controls">
        <input type="text" placeholder={text[language].placeholder} value={firstName}
               onChange={event => setFirstName(event.target.value)} ref={inputRef} maxLength={48} />
        <NextButton id="next_firstname" onClick={() => {
          incrementSlide()
        }} disabled={firstName.length === 0}/>
      </section>
    </Slide>
  )
}

export default FirstNameSlide