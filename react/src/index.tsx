import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import {ProvideGlobalState} from "./state";


ReactDOM.render(
    <React.StrictMode>
        <ProvideGlobalState>
            <App/>
        </ProvideGlobalState>
    </React.StrictMode>,
    document.getElementById('root')
)