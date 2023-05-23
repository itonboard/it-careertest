import { useCallback, useRef } from 'react'
import { SendButton } from '../Button'
import Slide, { ActiveHandler, SC } from './Slide'
import { Languages, useGlobalState } from '../../state'

const FirstNameSlide: SC = ({ status }) => {
  const { decrementSlide, firstName, lastName, language, incrementSlide, setLastName, infoModalOpen } = useGlobalState()
  const inputRef = useRef<HTMLInputElement>(null)

  const text: Record<Languages, { text: JSX.Element, placeholder: string }> = {
    de: {
      text: <p>Geschafft! Vielen Dank für deine Antworten und deine Zeit, {firstName}<br/>Nenne uns bitte
        noch deinen Nachnamen, damit wir dir eine persönliche Auswertung erstellen können.</p>,
      placeholder: 'Dein Nachname…'
    },
    en: {
      text: <p>Done! Thank you for your answers and your time, {firstName}<br/>Please tell us
        your last name, so that we can create a personal feedback for you.</p>,
      placeholder: 'Your last name…'
    }
  }

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
  }, [decrementSlide, incrementSlide, infoModalOpen])

  return (
    <Slide name="text-input" status={status} onActive={keyEventHandler}>
      <section className="slide-content">
        {text[language].text}
      </section>
      <section className="slide-controls">
        <input type="text" placeholder={text[language].placeholder} value={lastName}
               onChange={event => setLastName(event.target.value)} ref={inputRef} maxLength={48} />
        <SendButton id="next_lastName"
                    onClick={() => {
                      incrementSlide()
                      setLastName(lastName)
                    }}
                    disabled={lastName.length === 0}/>
      </section>
    </Slide>
  )
}

export default FirstNameSlide