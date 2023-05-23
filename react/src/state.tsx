import {createContext, FC, useContext, useState} from "react";

export enum OccupationGroup {
    HE,
    HA,
    SE,
    GE,
    KA,
    PM
}

export type Languages = 'en' | 'de'

type GlobalStateValue =
    Pick<ReturnType<typeof useProvideGlobalState>,
        'firstName'|'lastName'|'language'|'questions'|'answers'|'currentSlide'|'clientId'
    > &
    Partial<Pick<ReturnType<typeof useProvideGlobalState>,
        'setFirstName'|'setLastName'|'setLanguage'|'setQuestions'|'setAnswer'|'setCurrentSlide'|'incrementSlide'|'setClientId'
    >>

const globalStateContext = createContext<GlobalStateValue>({
    firstName: '',
    lastName: '',
    language: 'en',
    questions: [],
    answers: {},
    currentSlide: 0,
    clientId: null
})

export const ProvideGlobalState: FC = ({ children }) => {
    const state = useProvideGlobalState()
    return <globalStateContext.Provider value={state}>{children}</globalStateContext.Provider>
}

export const useGlobalState = () => useContext(globalStateContext) as ReturnType<typeof useProvideGlobalState>

export const useProvideGlobalState = () => {
    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [language, setLanguage] = useState<Languages>('en')
    const [questions, setQuestions] = useState<{ id: number, text: string, group: OccupationGroup }[]>([])
    const [answers, setAnswers] = useState<Record<number, 1|2|3|4|5>>({})
    const [currentSlide, setCurrentSlide] = useState<number>(0)
    const [clientId, setClientId] = useState<string|null>(null)
    const [infoModalOpen, setInfoModalOpen] = useState(false)

    const incrementSlide = () => setCurrentSlide(prev => prev + 1)
    const decrementSlide = () => setCurrentSlide(prev => prev - 1)

    const setAnswer = (id: number, value: 1 | 2 | 3 | 4 | 5) => setAnswers(prev => {
        return {
            ...prev,
            [id]: value
        }
    })

    return {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        language,
        setLanguage,
        questions,
        setQuestions,
        answers,
        setAnswer,
        currentSlide,
        setCurrentSlide,
        incrementSlide,
        decrementSlide,
        clientId,
        setClientId,
        infoModalOpen,
        setInfoModalOpen
    }
}