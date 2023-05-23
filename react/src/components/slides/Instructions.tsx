import Slide, { ActiveHandler, SC } from './Slide'
import { Languages, useGlobalState } from '../../state'
import { useCallback } from 'react'
import { NextButton } from '../Button'

const instructionsText: Record<Languages, JSX.Element> = {
  de: (
    <>
      <p>Liebe:r Teilnehmer:in,</p>
      <p>Willkommen beim IT-spezifischen Berufsinteressentest des Erasmus+ Projektes „ITONBOARD“. <br/>Mit ITONBOARD werden junge Menschen über die beruflichen Möglichkeiten in IT-Berufen informiert.</p>
      <p>Der Fragebogen beinhaltet verschiedene IT-Tätigkeiten, zu denen du angeben sollst, wie sehr diese dich interessieren.</p>
      <p>Der Berufsinteressentest soll anhand deiner Antworten herausfinden, wie groß dein Interesse im IT-Bereich ist und in welchem Bereich der IT genau dieses Interesse am höchsten ist.</p>
      <p>Bei deinen Angaben ist es nicht wichtig, ob du denkst, dass du diese
        Tätigkeiten ausführen kannst, sondern nur, wie viel Spaß es dir machen würde.<br/>Du kannst Zahlen von 1 bis 5 vergeben. Dabei gilt: Je größer die Zahl, desto stärker ist dein Interesse für diese Tätigkeit. Die einzelnen Zahlen bedeuten:</p>
      <dl>
        <dt>1</dt>
        <dd>Diese Tätigkeit interessiert mich gar nicht.</dd>
        <dt>2</dt>
        <dd>Diese Tätigkeit interessiert mich wenig.</dd>
        <dt>3</dt>
        <dd>Diese Tätigkeit interessiert mich etwas.</dd>
        <dt>4</dt>
        <dd>Diese Tätigkeit interessiert mich ziemlich.</dd>
        <dt>5</dt>
        <dd>Diese Tätigkeit interessiert mich sehr.</dd>
      </dl>
      <p>Wir wissen, dass es viele Fragen sind. Es wäre jedoch sehr wichtig, dass du alle beantwortest.</p>
      <p>Wenn du dich zusätzlich zu dem Fragebogen über das Projekt informieren möchtest, findest du alle Informationen unter <a
        href="https://www.itonboard.eu" target="_blank" rel="noreferrer">www.itonboard.eu</a>.</p>
    </>
  ),
  en: (
    <>
      <p>Dear Participant,</p>
      <p>Welcome to the IT-specific career interest test of the Erasmus+ project "ITONBOARD".</p>
      <p>ITONBOARD informs young people about career opportunities in IT professions.</p>
      <p>The questionnaire includes different IT jobs and asks you to indicate how much you are interested in them.</p>
      <p>The purpose of the career interest test is to find out, based on your answers, how much you are interested in the IT sector and in which area of IT exactly this interest is highest.</p>
      <p>It is not important whether you think you can perform these tasks, but only how much you would enjoy doing them.</p>
      <p>You can give scores from 1 to 5. The higher the score, the more interested you are in this activity. The individual scores mean:</p>
      <dl>
        <dt>1</dt>
        <dd>This activity does not interest me at all.</dd>
        <dt>2</dt>
        <dd>This activity interests me a little.</dd>
        <dt>3</dt>
        <dd>This activity interests me a fair bit.</dd>
        <dt>4</dt>
        <dd>This activity interests me quite a bit.</dd>
        <dt>5</dt>
        <dd>This activity interests me a lot.</dd>
      </dl>
      <p>We know that there are many questions. However, it would be very important that you answer them all.</p>
      <p>If you want to find out more about the project, you can find all the information at <a
        href="https://www.itonboard.eu">www.itonboard.eu</a>.</p>
    </>
  )
}

const InstructionsSlide: SC = ({ status }) => {
  const { decrementSlide, incrementSlide, language, infoModalOpen } = useGlobalState()

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
    <Slide name='instructions' status={status} onActive={keyEventHandler}>
      {instructionsText[language]}
      <NextButton id='next_instructions' onClick={incrementSlide} />
    </Slide>
  )
}

export default InstructionsSlide