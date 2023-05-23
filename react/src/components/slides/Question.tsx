import { Fragment, useCallback, useState } from 'react'
import Slide, { ActiveHandler, SC } from './Slide'
import { Languages, OccupationGroup, useGlobalState } from '../../state'
import { backText } from '../Button'
import { ArrowRight } from 'react-bootstrap-icons'

function * range (stop: number, start: number = 0, step: number = 1): Iterable<number> {
  for (let i = start; i < stop; i += step) yield i
}

const question_headline_text: Record<Languages, String> = {
  de: 'wie bewertest du diese Aussage:',
  en: 'how do you rate this statement:'
}

const question_underline_text: Record<Languages, String> = {
  de: 'Interessiert mich...',
  en: 'I\'m interested...'
}

const question_underline_endings: Record<Languages, Record<string, string>> = {
  de: { first: '... gar nicht', second: '... sehr' },
  en: { first: '... not at all', second: '... very' }
}

const QuestionSlide: SC<{ question: { id: number, text: string, group: OccupationGroup } }> = ({
  question,
  status
}) => {

  const { firstName, language, setAnswer, incrementSlide, decrementSlide, clientId, setClientId, infoModalOpen } = useGlobalState()
  const [answer, setAnswer_] = useState<number>(NaN)

  const keyEventHandler = useCallback<ActiveHandler>(() => {
    const callback = (event: KeyboardEvent) => {
      if (infoModalOpen) return
      const asNum = parseInt(event.key)
      if (!isNaN(asNum) && asNum >= 1 && asNum <= 5) {
        event.preventDefault()
        setAnswer_(asNum)
        setAnswer(question.id, asNum as 1|2|3|4|5)
        incrementSlide()
      } else if (event.key === 'Enter' && !isNaN(answer)) {
        event.preventDefault()
        incrementSlide()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        decrementSlide()
      }
    }

    if (clientId === null && question.id === 1) {
      fetch('/client_started', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `lang=${language}`
      })
        .then(async response => {
          if (response.status !== 201) {
            console.warn(`Unable to register client: ${response.status} ${response.statusText}`)
            return
          }
          return await response.text()
        })
        .then(id => setClientId(id as string))
        .catch(error => console.warn(`Unable to register client: ${error}`))
    }

    window.addEventListener('keydown', callback)
    return () => window.removeEventListener('keydown', callback)
  }, [clientId, question.id, infoModalOpen, answer, setAnswer, incrementSlide, decrementSlide, language, setClientId])

  return (
    <Slide name="question" status={status} onActive={keyEventHandler}>
      <div className="slide-content">
        <div className="question-headline">{firstName}, {question_headline_text[language]}
          <p className="slide-headline-markup">
            {question.id} <ArrowRight/>
          </p>
        </div>
        <p className="question" data-number={question.id}>
          {question.text}.
        </p>
        <p className={'input-headline'}>
          {question_underline_text[language]}
        </p>
        <div className="input-wrapper">
          {([...range(6, 1)] as (1 | 2 | 3 | 4 | 5)[]).map(num => (
            <Fragment key={`answer_${question.id}_${num}`}>
              {
                num === answer
                ? <input
                    type='radio'
                    name={`answer_${question.id}_${num}`}
                    id={`answer_${question.id}_${num}`}
                    checked={true}
                    onClick={() => incrementSlide()}
                  />
                : <input
                    type='radio'
                    name={`answer_${question.id}_${num}`}
                    id={`answer_${question.id}_${num}`}
                    checked={false}
                    onChange={() => {
                      setAnswer_(num)
                      setAnswer(question.id, num)
                      incrementSlide()
                    }}
                  />
              }
              <label htmlFor={`answer_${question.id}_${num}`}>{num}</label>
            </Fragment>
          ))}
        </div>
        <div className="input-infos">
          <p className="input-less">{question_underline_endings[language].first}</p>
          <p className="input-much">{question_underline_endings[language].second}</p>
        </div>
      </div>
      <span className="back-span" onClick={decrementSlide}>{backText[language]}</span>
    </Slide>
  )
}

export default QuestionSlide