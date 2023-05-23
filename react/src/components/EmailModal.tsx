import React, {FC, useState} from "react";
import {Languages, useGlobalState} from '../state'
import {getPoints} from './slides/Evaluation'
import {CheckCircle} from "react-bootstrap-icons";

const createFormData = (data: Record<string | number, string | number>): string =>
    Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')


const EmailModal: FC<{ show: boolean, handleClose: () => void, large?: boolean }> = ({
                                                                                         show,
                                                                                         large,
                                                                                         handleClose
                                                                                     }) => {
    const [success, setSuccess] = useState<'success' | 'failure' | 'unset'>('unset')
    const [emailAddress, setEmailAddress] = useState<string>('')
    const [honeyPot, setHoneyPot] = useState<string>('')
    const [isValid, setIsValid] = useState<boolean>(false)
    const {answers, language, firstName, lastName, questions} = useGlobalState()


    const send_button_text: Record<Languages, string> = {
        de: 'Senden',
        en: 'Send'
    }

    const close_button_text: Record<Languages, string> = {
        de: 'Schließen',
        en: 'Close'
    }

    const headline_text: Record<Languages, string> = {
        de: `Hey ${firstName}, gib hier bitte deine persönliche E-mail Adresse an, 
        damit wir dir deine Auswertung senden können.`,
        en: `Hey ${firstName}, please enter your personal e-mail address here 
        so that we can send you your evaluation.`
    }

    const feedback_message_texts: Record<Languages, JSX.Element> = {
        de: <><h3>Vielen Dank!</h3><span>Die Mail mit Deiner persönlichen Auswertung wurde versendet.</span></>,
        en: <><h3>Thank you!</h3><span>The mail with your personlized results report has been sent.</span></>,
    }

    const sendMail = () => {
        if (honeyPot === '')
            fetch('/send',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: createFormData({
                        ...getPoints(questions, answers),
                        first_name: firstName,
                        last_name: lastName,
                        address: emailAddress,
                        lang: language
                    })
                }
            ).then(async (res) => {
                    if (res.status.toString().charAt(0) === '2')
                        setSuccess('success')
                    else
                        setSuccess('failure')
                }
            )
    }

    const handleInput = (newInput: string) => {
        setEmailAddress(newInput)
      // eslint-disable-next-line no-control-regex
        if (/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(newInput))
            setIsValid(true)
        else
            setIsValid(false)
    }

    const closeModal = () => {
        setSuccess('unset')
        handleClose()
    }


    return (
        <>
            <div className={`modal-wrapper ${show ? '' : 'hidden'}`} onClick={() => closeModal()}/>

            <div
                className={`modal-body ${large ? 'large' : 'small'} ${show ? '' : 'hidden'} modal-${success === 'success' ? 'success' : success === 'unset' ? 'undefinde' : 'not-success'}`}>

                {
                    success === 'unset' || success === 'failure' ?
                        <>
                            <div className={'modal-header'}>
                                <p>
                                    {headline_text[language ?? 'de']}
                                </p>
                            </div>

                            <div className={'modal-main'}>
                                <label>E-Mail:</label>
                                <input type="email" value={emailAddress}
                                       onChange={(event => handleInput(event.target.value))}/>
                                <input type="text" onChange={(event => setHoneyPot(event.target.value))} hidden={true}/>
                            </div>

                            <div className={`modal-footer button-wrapper`}>
                                {

                                    success === 'unset' || success === 'failure' ? <button
                                        className={`close-button`}
                                        onClick={() => sendMail()} disabled={!isValid}>
                                        {
                                            send_button_text[language ?? 'de']
                                        }
                                    </button> : ''
                                }
                            </div>
                        </>
                        :
                        <>
                        <div className={'modal-main'}>
                            <CheckCircle />
                            <span>{feedback_message_texts[language]}</span>
                        </div>
                        <div className={`modal-footer button-wrapper`}>
                            <button
                                className={`close-button`}
                                onClick={() => closeModal()} disabled={!isValid}>
                                {
                                    close_button_text[language ?? 'de']
                                }
                            </button>
                        </div>
                        </>

                }
            </div>
        </>


    )
}

export default EmailModal