import {Fragment} from 'react'
import './App.css'
import ProgressBar from './components/ProgressBar'
import {
  Evaluation,
  FirstName,
  Halftime, Instructions,
  LanguageSelect,
  LastName,
  PrivacyPolicy,
  Question
} from './components/slides'
import { useGlobalState } from './state'
import Disclaimer from './components/Disclaimer'

function App () {
  const { currentSlide, questions } = useGlobalState()

  const getStatus = (num: number): 'active' | 'next' | 'prev' => num > currentSlide ? 'next' : (num < currentSlide ? 'prev' : 'active')

  return (
    <>
      <ProgressBar max={questions !== undefined ? questions.length + 2 : -1} value={Math.max(currentSlide - 3, 0)}/>
      <main>
        <LanguageSelect status={getStatus(0)}/>
        <Instructions status={getStatus(1)}/>
        <PrivacyPolicy status={getStatus(2)}/>
        <FirstName status={getStatus(3)}/>
        {
          questions.map((question, idx, { length }) => {
            const half = Math.floor(length / 2)
            if (idx === half) {
              return (
                <Fragment key={`question_${idx}`}>
                  <Halftime status={getStatus(4 + idx)}/>
                  <Question question={question} status={getStatus(5 + idx)}/>
                </Fragment>
              )
            } else {
              return <Question key={`question_${idx}`} question={question}
                               status={getStatus((idx < half ? 4 : 5) + idx)}/>
            }
          })
        }
        <LastName status={getStatus(5 + questions.length)}/>
        <Evaluation status={getStatus(6 + questions.length)} />
      </main>
      <Disclaimer />
    </>
  )
}

export default App
