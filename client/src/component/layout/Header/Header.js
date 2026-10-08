import "./Header.scss"
import {faMagnifyingGlass, faBell, faUser} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useEffect, useState} from "react";
import logo from "../../../assets/logo.png";
import React from "react";
import {useLogged} from "../../../providers/isLogged";
import {useHistory} from "react-router-dom";
import axios from "axios";
import Notification from "../../blocks/Notification/Notification";

function Header() {
    const {userLogged, currentPage, filter, setFilter} = useLogged();
    let history = useHistory();
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const [notificationPopUp, setNotificationPopUp] = useState(false);
    const [notifications, setNotifications] = useState(null);
    const [newNotifications, setNewNotifications] = useState(false);


    useEffect(() => {
        axios.get(`${API_URL}/interaction/notifications`)
            .then(response => setNotifications(response.data));
        if(notifications) {
            notifications.map(n => {
                if(n.Viewed === null) {
                    setNewNotifications(true);
                }
            })
        }
    }, []);


    const refreshNotifications = async () => {
        axios.get(`${API_URL}/interaction/notifications`)
            .then(response => setNotifications(response.data));
    }

    useEffect(() => {
        if(notifications) {
            notifications.map(n => {
                if(n.Viewed === null) {
                    setNewNotifications(true);
                }
            })
        }
    }, [notifications])


    function handleClick() {
        if(filter !== '')
            history.push(`/results?search_query=${filter}`);
    }

    const loginPage = () => {
        history.replace("/login");
    }

    const redirectProfile = async () => {
        history.replace(`/profile/${userLogged.User_ID}`);
        window.location.reload();
    }

    const redirectHome = () => {
        history.replace(`/home`);
    }

    const watchNotification = async () => {
        setNewNotifications(false);
        setNotificationPopUp(!notificationPopUp);

        // GO TO DATABASE AND UPDATE EVERY VIEWED IN THE INTERACTION TABLE FROM NULL TO 1

        try {
            await axios.post(`${API_URL}/interaction/viewed`).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
    }

    const handleKeyPress = (event) => {
        if(event.key === 'Enter'){
            handleClick();
        }
    }

    return <div className={((["login", "forgetPassword", "register", "embed"].includes(currentPage)) ? 'hideHeader' : 'Header')}>

        <div className='logo'>
            <div className='logo-img' style={{ backgroundImage: `url(${logo})` }} onClick={() => redirectHome()}></div>
        </div>
        <div className={"container_input"}>
            <input className={"search"}
                   onKeyPress={handleKeyPress}
                   type="text"
                   placeholder="Pesquisar"
                   onChange={e => {
                       setFilter(e.target.value)
                   }}
            />
            <div onClick={()=> {handleClick()}} className='button'><FontAwesomeIcon className={"icon"} icon={faMagnifyingGlass}/></div>
        </div>
        {notificationPopUp && <div className='wrapper-notification' onClick={() => setNotificationPopUp(false)}>
            <div className='notification-box' onClick={e=>e.stopPropagation()}>
                <h2>Notificações</h2>
                <div className={"notifications-scroll-container"} onClick={e=>e.stopPropagation()}>
                    {notifications && notifications.map(n => {
                        if(n.Viewed !== 3) {
                            return <Notification
                                key={n.Interaction_ID}
                                interactionId={n.Interaction_ID}
                                typeId={n.Type_ID}
                                channelId={n.Channel_ID}
                                userId={n.User_ID}
                                photo={n.User_Photo}
                                userName={n.userName}
                                videoId={n.Video_ID}
                                achievementId={n.Achievement_ID}
                                achievementName={n.Achievement_Name}
                                achievementItem={`http://localhost:3001/achievement/${n.Achievement_Item}.png`}
                                days={n.Interaction_Post_Date}
                                viewed={n.Viewed}
                                refresh={refreshNotifications}
                            />
                        }})}
                </div>
            </div>
        </div>}

        <div className='session'>
            {userLogged && <div className='user'>
                <div className='notification' onClick={() => watchNotification()}>
                    <FontAwesomeIcon className={"icon"} icon={faBell}/>
                    <div className='notification-sign' style={newNotifications ? ({ backgroundColor: `red`}) : ({ backgroundColor: ``})}></div>
                </div>
                <div className='userPhoto' onClick={() => redirectProfile()} style={{ backgroundImage: `url(${userLogged.User_Photo})`}}></div>
            </div>}
            {!userLogged && <div className='noUser' onClick={() => loginPage()}>
                <span>Iniciar sessão</span>
                <div className='circle'><FontAwesomeIcon className={"icon"} icon={faUser}/></div>
            </div>}
        </div>
    </div>
}

export default Header;
