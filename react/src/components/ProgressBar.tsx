import { FC } from 'react'

const ProgressBar: FC<{ max: number, value: number }> = ({ max, value }) => <progress id='progress-bar' max={max} value={value}/>

export default ProgressBar