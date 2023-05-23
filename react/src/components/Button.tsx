import { FC, MouseEventHandler } from 'react'
import {Languages, useGlobalState} from "../state";

export const backText: Record<Languages, string> = {
  de: 'Zurück',
  en: 'Back'
}

const Button: FC<{ text: Record<Languages, string|JSX.Element>, onClick?: MouseEventHandler<HTMLButtonElement>, id: string, disabled?: boolean, large?: boolean }> = ({ text, onClick, id, disabled, large }) => {
  const { language , decrementSlide} = useGlobalState()

  return (
    <div className={`button-wrapper${large ? ' button-large' : ''}`}>
      <button onClick={onClick} id={id} disabled={disabled}>{text[language]}</button>
      <span className='back-span' onClick={decrementSlide}>{backText[language]}</span>
    </div>
  )
}

export const NextButton: FC<{ onClick?: MouseEventHandler<HTMLButtonElement>, keys?: string[], id: string, disabled?: boolean, large?: boolean }> = props => {
  const text = { en: 'Next', de: 'Weiter' }
  return <Button {...props} text={text} />
}


export const OkButton: FC<{ onClick?: MouseEventHandler<HTMLButtonElement>, keys?: string[], id: string, disabled?: boolean, large?: boolean }> = props => {
  const text = { en: 'Ok', de: 'Ok' }
  return <Button {...props} text={text} />
}

export const StartButton: FC<{ onClick?: MouseEventHandler<HTMLButtonElement>, keys?: string[], id: string, disabled?: boolean, large?: boolean }> = props => {
  const text = { en: 'Start', de: 'Starten' }
  return <Button {...props} text={text} />
}

export const SendButton: FC<{ onClick?: MouseEventHandler<HTMLButtonElement>, keys?: string[], id: string, disabled?: boolean, large?: boolean }> = props => {
  const text = { en: 'Send', de: 'Senden' }
  return <Button {...props} text={text} />
}


export default Button
