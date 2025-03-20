import React from 'react'
import './style.css'
import { getStatusClass } from '../../common/buttuns_status'

const StatusField = ({text,status}) => {
    return (
        <div className={getStatusClass(status)}>
            <div className="text-wrapper">{text}</div>
        </div>
    )
}

export default StatusField