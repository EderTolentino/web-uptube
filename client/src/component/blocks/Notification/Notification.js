import "./Notification.scss"
import React, {useState} from "react";
import axios from "axios";
import {useHistory} from "react-router-dom";

function Notification(props) {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    let history = useHistory();
    const [editPopup, setEditPopup] = useState(false);
    const today = new Date();
    const diffInMs = new Date(today) - new Date(props.days)
    let diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    diffInDays = Math.floor(diffInDays);

    const addViewChannel = async (channelId) => {
        await axios.post(`${API_URL}/view/channel`, {channelId: channelId}).then((res) => {
            console.log(res.data);
        });
    }

    const togglePopup = () => {
        setEditPopup(!editPopup);
    }

    const redirectNotification = async () => {
        if([1, 2, 3, 4].includes(props.typeId)) {
            history.replace(`/watch?v=${props.videoId}`);
        }

        if(props.typeId === 5) {
            history.replace(`/profile/${props.userId}`);
            await addViewChannel(props.userId);
        }

        if(props.typeId === 6) {
            history.replace(`/profile/${props.channelId}`);
            await addViewChannel(props.channelId);
        }

        try {
            await axios.post(`${API_URL}/interaction/opened`, {interactionId: props.interactionId}).then((res) => {
                console.log(res.data);
            })
        } catch (err) {
            console.log(err);
        }
        await props.refresh();
    }

    const handleRemove = async () => {
        try {
            await axios.post(`${API_URL}/interaction/hide`, {interactionId: props.interactionId}).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
        await props.refresh();
    }

    let message = '';
    switch (props.typeId) {
        case 1:
            message = 'deu um like no teu vídeo.'
            break;
        case 2:
            message = 'deu um dislike no teu vídeo.'
            break;
        case 3:
            message = 'comentou no teu vídeo.'
            break;
        case 4:
            message = 'reportou o teu vídeo.'
            break;
        case 5:
            message = 'subscreveu no teu canal.'
            break;
        case 6:
            message = 'Você conquistou o achievement de '
            break;
        default:
            message = 'Não há notificação!'
    }

    return <div className='Notification' style={(props.viewed === 2) ? ({ backgroundColor: `white`}) : ({ backgroundColor: `darkgrey`})} >
        {[1, 2, 3, 4, 5].includes(props.typeId) && <div className='photo' style={{ backgroundImage: `url(${props.photo})` }}></div>}
        {[6].includes(props.typeId) && <div className='photo' style={{ backgroundImage: `url(${props.achievementItem})` }}></div>}
        <div className='data' onClick={() => redirectNotification()}>
            <div className='channel'>
                <div className='name'>
                    {[1, 2, 3, 4, 5].includes(props.typeId) && <h3>{props.userName} {message}</h3>}
                    {[6].includes(props.typeId) && <h3>{message}{props.achievementName}</h3>}
                    <h3 className='date'>há {diffInDays} dias</h3>
                </div>
            </div>
        </div>
        <div className='edit_button'>
            <div className='btn-box' onClick={togglePopup} >
                <div className='menu-btn'>
                    <svg width="25" height="10" className='svg-box'>
                        <path d="M0,5 5,5"     stroke="#fff" strokeWidth="4"/>
                        <path d="M9,5 14,5"   stroke="#fff" strokeWidth="4"/>
                        <path d="M18,5 23,5"   stroke="#fff" strokeWidth="4"/>
                    </svg>
                </div>
            </div>
            <div className='delete_edit' style={editPopup ? {display: `block`} : {display: `none`}}>
                <div className='delete' onClick={() => handleRemove()}>Remover esta notificação</div>
            </div>
        </div>

    </div>
}

export default Notification;