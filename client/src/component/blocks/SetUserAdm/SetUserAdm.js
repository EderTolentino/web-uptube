import "./SetUserAdm.scss"
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
function SetUserAdm(props) {

    return <div className='SetUserAdm'>
        <div className='user'>
            <div className='select-adm' onClick={() => props.changePermission(props.userId, props.userAdm)}>{(props.userAdm === 1) ?
                <FontAwesomeIcon className={"check"} icon={faCheck}/> : ''}
            </div>
            <div className='user-id'>{props.userId}</div>
            <div className='user-name'>{props.userName} {props.userSurname}</div>
        </div>
    </div>
}

export default SetUserAdm;