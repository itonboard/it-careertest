import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import parseCSV from '../../utils/parseCSV'
import Slide, { ActiveHandler, SC } from '.'
import {Languages, OccupationGroup, useGlobalState} from "../../state";

const languageNames: Record<Languages, string> = {
  'en': 'English',
  'de': 'Deutsch'
}

const selectLanguage: Record<Languages, string> = {
  'en': 'Please choose a language.',
  'de': 'Bitte wähle eine Sprache aus.'
}

const headline: Record<Languages, string> = {
  'en': 'IT-specific career interest test',
  'de': 'IT-spezifischer Berufsinteressentest'
}


const StartSlide: SC = ({ status }) => {

  const { language, setLanguage, setQuestions, incrementSlide, infoModalOpen } = useGlobalState()
  const [selectedLanguage, setSelectedLanguage] = useState<Languages>(language)
  const languageCodes = useMemo(() => Object.keys(selectLanguage) as ['en', 'de'], [])
  const selectedLanguageIndex = useRef<number>(languageCodes.indexOf(selectedLanguage))
  const languageLoaded = useRef<boolean>(false)

  const nextSlide = useCallback(() => {
    const currentLanguage = languageCodes[selectedLanguageIndex.current]
    if (currentLanguage !== language) {
      setLanguage(currentLanguage)
    }

    if (!languageLoaded.current || currentLanguage !== language) {
      fetch(`./assets/Questions_${currentLanguage}.csv`)
        .then(async response => await response.text())
        .then(async csv => await parseCSV<{ id: number, text: string, group: OccupationGroup }[]>(
          csv,
          { header: ['id', 'text', 'group'] },
          {
            0: str => parseInt(str.substring(1)),
            2: str => {
              const OccupationGroup_: { [idx: string]: OccupationGroup } = OccupationGroup as any
              return OccupationGroup_[str.substring(0, 2)]
            }
          }
        ))
        .then(questions => setQuestions(questions))
        .catch(error => console.error(error))
    }

    incrementSlide()
  }, [incrementSlide, language, languageCodes, setLanguage, setQuestions])

  const keyEventHandler = useCallback<ActiveHandler>(() => {
    const callback = (event: KeyboardEvent) => {
      if (infoModalOpen) return
      if (event.key === 'Enter') {
        event.preventDefault()
        nextSlide()
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey)) {
        event.preventDefault()
        setSelectedLanguage(languageCodes[(selectedLanguageIndex.current + 1) % 3])
        selectedLanguageIndex.current = (selectedLanguageIndex.current + 1) % 3
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
        event.preventDefault()
        setSelectedLanguage(languageCodes[(selectedLanguageIndex.current + 2) % 3])
        selectedLanguageIndex.current = (selectedLanguageIndex.current + 2) % 3
      }
    }
    window.addEventListener('keydown', callback)

    return () => window.removeEventListener('keydown', callback)
  }, [languageCodes, nextSlide, infoModalOpen])

  return (
    <Slide name='language-selection' status={status} onActive={keyEventHandler}>
      <h1>
        <img src='/assets/logo_ITONBOARD_light.svg' alt='ITONBOARD'/>
        {headline[selectedLanguage]}
      </h1>
      <h3 className="select-language">
        {(Object.entries(selectLanguage) as [Languages, string][]).map(([shortName, longName], idx, { length }) =>
          <Fragment key={`lang_${shortName}`}>{longName}{idx + 1 < length ? ' / ' : ''}</Fragment>
        )}
      </h3>
      <div className="language-picker">
        {(Object.entries(languageNames) as [Languages, string][]).map(([code, name], idx) => (
          <Fragment key={name}>
            <input
              type='radio'
              name='language'
              id={`lang_${code}`}
              checked={code === selectedLanguage}
              onChange={() => {}}
              onClick={() => {
                setSelectedLanguage(code)
                selectedLanguageIndex.current = idx
                nextSlide()
              }}
            />
            <label htmlFor={`lang_${code}`}>{name}</label>
          </Fragment>
        ))}
      </div>
      <div className='button-wrapper'>
        <button onClick={nextSlide} id='start_language' className={'start-button'}>{{ en: 'Start', de: 'Starten' }[selectedLanguage]}</button>
      </div>
    </Slide>
  )
}

export default StartSlide