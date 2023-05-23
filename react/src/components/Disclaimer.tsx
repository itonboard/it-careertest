import { FC, useEffect, useRef, useState } from 'react'
import styles from '../styles/Disclaimer.module.css'
import { InfoCircle, XLg } from 'react-bootstrap-icons'
import { Languages, useGlobalState } from '../state'

type ModalState = 'opened' | 'opening' | 'closed' | 'closing'

const titleText: Record<Languages, string> = {
  'de': 'Copyright, Lizenz und Disclaimer',
  'en': 'Copyright, license and disclaimer'
}

const Disclaimer: FC = () => {
  const { infoModalOpen, setInfoModalOpen, language } = useGlobalState()
  const [state, setState] = useState<ModalState>('closed')
  const ref = useRef<HTMLDivElement>(null)

  const show = (): void => {
    setInfoModalOpen(true)
    setState('opening')
    ref.current?.addEventListener('animationend', () => setState('opened'), { once: true })
  }
  const close = (): void => {
    setState('closing')
    ref.current?.addEventListener('animationend', () => {
      setState('closed')
      setInfoModalOpen(false)
    }, { once: true })
  }

  useEffect(() => {
    const callback = (event: KeyboardEvent): void => {
      const isOpen = ref.current?.getAttribute('data-state') === 'opened'

      if (isOpen && event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }

    window.addEventListener('keydown', callback)

    return () => window.removeEventListener('keydown', callback)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <button
        className={styles.btn}
        aria-controls='disclaimer_modal'
        aria-expanded={infoModalOpen}
        onClick={show}
        title={titleText[language]}
        aria-label={titleText[language]}
      >
        <InfoCircle />
      </button>
      <div role='none' className={styles.wrapper} data-state={state} ref={ref}>
        <div
          role='dialog'
          aria-hidden={!infoModalOpen}
          id='disclaimer_modal'
          className={styles.modal}
        >
          <button className={styles.close} onClick={close}><XLg /></button>
          <div className={styles.license}>
            &copy; ITONBOARD
            <img src='/assets/cc-by-sa.png' alt='CC BY-SA' />
            This work is licensed under a <a href='http://creativecommons.org/licenses/by-sa/4.0/'>Creative Commons Attribution-ShareAlike 4.0 International License</a>.
          </div>
          <div className={styles.disclaimer}>
            The European Commission support for the production of this publication does not constitute an endorsement of the contents which reflects the views only of the authors, and the Commission cannot be held responsible for any use which may be made of the information contained therein.
          </div>
        </div>
        <div role='none' className={styles.backdrop} onClick={close} />
      </div>
    </>
  )
}

export default Disclaimer
