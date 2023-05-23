import Slide, { ActiveHandler, SC } from '.'
import React, { useCallback, useMemo, useState } from 'react'
import { Facebook, Instagram, Twitter } from 'react-bootstrap-icons'
import { Languages, OccupationGroup, useGlobalState } from '../../state'
import EmailModal from '../EmailModal'

export const getPoints = (
  questions: ReturnType<typeof useGlobalState>['questions'],
  answers: ReturnType<typeof useGlobalState>['answers']
): Record<'HE'|'HA'|'SE'|'GE'|'KA'|'PM', number> => {
  const points = {
    HE: 0,
    HA: 0,
    SE: 0,
    GE: 0,
    KA: 0,
    PM: 0
  }

  for (let i = 0; i < questions.length; i++) {
    const { id, group } = questions[i],
      answer = answers[id],
      char = OccupationGroup[group].toUpperCase() as 'HE'|'HA'|'SE'|'GE'|'KA'|'PM'

    points[char] += answer
  }

  return points
}

const evaluation_text: Record<Languages, JSX.Element> = {
  de: <div><h2> Vielen Dank für deine Antworten und deine Zeit.</h2>
    Um deine Ergebnisse zu speichern, kannst du auf „Herunterladen“ klicken und dir deinen Ergebnisbericht sofort
    herunterladen.<br/><br/>
    Sollte dies gerade nicht möglich sein, so klicke auf „Per E-Mail verschicken“. Dort kannst du die
    E-Mailadresse angeben, an welchen wir deinen Ergebnisbericht versenden sollen.
    Bitte beachte, dass wir keinerlei Daten speichern. Sobald du diese Seite schließt, wird dein
    Ergebnisbericht
    gelöscht und kann nicht reproduziert werden. Du kannst den IT-spezifischen Berufsinteressentest natürlich
    jederzeit wiederholen.<br/><br/>
    Solltest du weitere Fragen haben, so kannst du uns jederzeit per E-Mail oder Telefon
    kontaktieren.<br/><br/>
    <span style={{ fontSize: '1.2em' }}>Dein Team der ITONBOARD</span>
  </div>,
  en: <div><h2>Thank you for your answers and your time.</h2>
    To save your results, you can click on "Download" and immediately download your result
    report.<br/><br/>
    If this is not possible at the moment, click on "Send by e-mail". There you can enter the e-mail address
    to
    which we should send your result report.
    Please note that we do not store any data. As soon as you close this page, your result report will be
    deleted and cannot be reproduced. Of course, you can repeat the It-specific career test at
    any time.<br/><br/>
    If you have any further questions, please do not hesitate to contact us by e-mail or phone.<br/><br/>
    <span style={{ fontSize: '1.2em' }}>Your ITONBOARD team</span>
  </div>
}

const outputButtonText: Record<Languages, string> = {
  de: 'Herunterladen',
  en: 'Download'
}

const mailButtonText: Record<Languages, string> = {
  de: 'Per E-Mail senden',
  en: 'Send by e-mail'
}

const EvaluationSlide: SC = ({ status }) => {

  const { answers, questions, language, firstName, lastName, clientId } = useGlobalState()
  const [showModal, setShowModal] = useState<boolean>(false)

  const results = useMemo<ReturnType<typeof getPoints>>(() => getPoints(questions, answers), [questions, answers])

  const activeHandler = useCallback<ActiveHandler>(() => {
    fetch('/client_finished', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: Object.entries({
        id: clientId,
        lang: language,
        results: encodeURIComponent(JSON.stringify(results))
      }).map(([key, val]) => `${key}=${val}`).join('&')
    })
      .then(response => {
        if (response.status !== 201) {
          console.warn(`Unable to register client: ${response.status} ${response.statusText}`)
        }
      })
      .catch(error => console.warn(`Unable to register client: ${error}`))
  }, [clientId, language, results])

  return (
    <>
      <Slide name="evaluation" status={status} onActive={activeHandler}>
        <div className="evaluation-container" id={'evaluation-container'}>
          <h1>
            <img src="/assets/logo_ITONBOARD_light.svg" alt="ITONBOARD"/>
          </h1>
          {evaluation_text[language]}
          <div className={'options'}>
            <div className={'other-buttons'}>
              <button onClick={() => setShowModal(!showModal)}>{mailButtonText[language ?? 'de']}</button>
              <form style={{ margin: '0', padding: '0' }} action={language === 'en' ? '/IT-specific-career-test.pdf' : '/IT-spezifischer-berufsinteressentest.pdf'} method="post" target="_blank">
                {Object.entries(results).map(([key, value]) => <input type="hidden" name={key}
                                                                                            value={isNaN(value) ? 0 : value} key={key}/>)}
                <input type="hidden" name="first_name" value={firstName}/>
                <input type="hidden" name="last_name" value={lastName}/>
                <input type="hidden" name="lang" value={language}/>
                <button type="submit">{outputButtonText[language ?? 'de']}</button>
              </form>
            </div>

            <div className={'social-media-buttons'}>


              {
                [{
                  icon: <Instagram/>,
                  class: 'instagram',
                  link: 'https://www.instagram.com/itonboard/'
                },
                  {
                    icon: <Facebook/>,
                    class: 'facebook',
                    link: 'https://www.facebook.com/Itonboard-100536088790600/'
                  },
                  {
                    icon: <Twitter/>,
                    class: 'twitter',
                    link: 'https://twitter.com/itonboard'
                  }].map((icon, idx) =>
                  <a href={icon.link} target="_blank" className={'social-media-button-wrapper'} key={idx}
                     rel="noreferrer">
                    <button className={`social-media-button type-${icon.class}`}>
                      {icon.icon}
                    </button>
                  </a>
                )}
            </div>
          </div>
        </div>
      </Slide>
      <EmailModal show={showModal} large={true} handleClose={() => setShowModal(!showModal)}/>
    </>
  )
}

export default EvaluationSlide
