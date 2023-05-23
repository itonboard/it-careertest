import { NextButton } from '../Button'
import Slide, { ActiveHandler, SC } from './Slide'
import { Languages, useGlobalState } from '../../state'
import { useCallback } from 'react'

const HalftimeSlide: SC = ({ status }) => {

  const { decrementSlide, firstName, language, incrementSlide, infoModalOpen } = useGlobalState()

  const text: Record<Languages, JSX.Element> = {
    de: <p>Sehr gut bisher, {firstName}! Du hast schon die Hälfte der Fragen erfolgreich geschafft!</p>,
    en: <p>Very good so far, {firstName}! You have already successfully completed half of the questions!</p>
  }

  const keyEventHandler = useCallback<ActiveHandler>(() => {
    const callback = (event: KeyboardEvent) => {
      if (infoModalOpen) return
      if (event.key === 'Enter') {
        event.preventDefault()
        incrementSlide()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        decrementSlide()
      }
    }

    window.addEventListener('keydown', callback)
    return () => window.removeEventListener('keydown', callback)
  }, [decrementSlide, incrementSlide, infoModalOpen])

  return (
    <Slide name="halftime" status={status} onActive={keyEventHandler}>
      <section className="slide-content">
        <img src="/assets/halftime-show.jpg" alt="ITONBOARD" onClick={incrementSlide}/>
        <h1>
          {text[language]}
        </h1>
      </section>
      <NextButton id="btn--nest_slide" onClick={incrementSlide}/>
    </Slide>
  )
}

export default HalftimeSlide
