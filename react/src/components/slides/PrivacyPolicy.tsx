import { useCallback, useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import { OkButton } from '../Button'
import Slide, { SC, ActiveHandler } from '.'
import { ExclamationTriangle } from 'react-bootstrap-icons'
import { Languages, useGlobalState } from '../../state'

enum PolicyState {
  DECLINED,
  ACCEPTED,
  UNSET
}

const PrivacyPolicy: SC = ({ status }) => {
  const { decrementSlide, language, incrementSlide, infoModalOpen } = useGlobalState()

  const [text, setText] = useState<string>()
  const [policyState, setPolicyState] = useState(PolicyState.UNSET)
  const labels: Record<Languages, Record<'accepted' | 'declined', string>> = {
    en: { accepted: 'I agree', declined: 'I do not agree' },
    de: { accepted: 'Ich stimme zu', declined: 'Ich stimme nicht zu' }
  }

  const badges: Record<Languages, string> = {
    en: 'Please agree to the terms and conditions.',
    de: 'Bitte stimme den Geschäftsbedingungen zu.'
  }

  useEffect(() => void fetch(`/assets/datenschutzerklaerung_${language}.md`)
      .then(response => response.text())
      .then(text => setText(text))
    , [language])

  const ref = useRef<HTMLElement>(null)

  const keyEventHandler = useCallback<ActiveHandler>(() => {
    const scroll = () => {
      if (ref.current != null) {
        const maxScroll = ref.current.scrollHeight - ref.current.clientHeight
        if (ref.current.scrollTop < maxScroll) ref.current.scrollTop = maxScroll
      }
    }
    const callback = (event: KeyboardEvent) => {
      if (infoModalOpen) return
      const state: PolicyState = PolicyState[ref.current?.getAttribute('data-policy') as keyof typeof PolicyState ?? 'UNSET']
      if (event.code === 'KeyA') {
        event.preventDefault()
        scroll()
        setPolicyState(PolicyState.ACCEPTED)
      } else if (event.code === 'KeyB') {
        event.preventDefault()
        scroll()
        setPolicyState(PolicyState.DECLINED)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        scroll()
        if (state === PolicyState.ACCEPTED)
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
    <Slide name="privacy-policy" status={status} onActive={() => keyEventHandler()} ref={ref}
           data-policy={PolicyState[policyState]}>
      <div className="privacy-policy-container">
        <div dangerouslySetInnerHTML={{ __html: marked(text ?? '') }}/>
        <div className="privacy-policy-container-options">
          <input type="radio" name="privacy_policy" id="privacy_policy_accept"
                 checked={policyState === PolicyState.ACCEPTED}
                 onChange={() => setPolicyState(PolicyState.ACCEPTED)}/>
          <label
            className={`ratio-label a ${policyState === PolicyState.ACCEPTED ? 'ratio-label-active' : ''}`}
            htmlFor="privacy_policy_accept">{labels[language].accepted}</label>
          <input type="radio" name="privacy_policy" id="privacy_policy_decline"
                 checked={policyState === PolicyState.DECLINED}
                 onChange={() => setPolicyState(PolicyState.DECLINED)}/>
          <label
            className={`ratio-label b ${policyState === PolicyState.DECLINED ? 'ratio-label-active' : ''}`}
            htmlFor="privacy_policy_decline">{labels[language].declined}</label>
          {
            policyState === PolicyState.ACCEPTED
              ? <OkButton
                id="privacy_policy_next"
                onClick={incrementSlide}
                disabled={policyState !== PolicyState.ACCEPTED}
              />
              :
              policyState === PolicyState.UNSET
                ? <OkButton
                  id="privacy_policy_next"
                  onClick={incrementSlide}
                  disabled={true}
                />
                :

                <div className={'info-badge'}>
                  <ExclamationTriangle/> {badges[language]}
                </div>
          }
        </div>
      </div>
    </Slide>
  )
}

export default PrivacyPolicy