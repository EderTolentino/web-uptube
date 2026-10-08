import "./Navigation.scss";
import {NavLink, useHistory} from "react-router-dom";
import {useLogged} from "../../../providers/isLogged";
import TopTags from "../../blocks/TopTags/TopTags";
import {faHouse, faFire, faClapperboard, faRotateLeft, faPlay, faVideo, faRightFromBracket, faMagnifyingGlass, faGear, faBuilding} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import axios from "axios";

function Navigation() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {userLogged, setUserLogged, currentPage} = useLogged();
    let history = useHistory();

    if(userLogged)
        console.log(userLogged)

    const logoutUser = async () => {
        // http://localhost:3001/user/logout
        axios.post('http://localhost:3001/user/logout')
            .then((res) => {
                console.log(res.data);
                history.replace("/Home");
            }).catch((error) => {
            console.log(error);
        });
        setUserLogged(null);
    }

    const addViewChannel = async () => {
        await axios.post(`${API_URL}/view/channel`, {channelId: userLogged.User_ID}).then((res) => {
            console.log(res.data);
        });
    }

    const redirectProfile = async () => {
        history.replace(`/profile/${userLogged.User_ID}`);
        window.location.reload();
    }

    return <nav className={((["login", "forgetPassword", "newPassword", "register", "embed"].includes(currentPage)) ? 'hideNavigation' : 'Navigation')}>
        <div className={"Container"}>
            {userLogged && <div className='user' >
                <div className='userPhoto' onClick={() => redirectProfile()} style={{ backgroundImage: `url(${userLogged.User_Photo})`}}></div>
                <div className='userData'>
                    <div className='userName' onClick={() => redirectProfile()}>{userLogged.User_Name + ' ' + userLogged.User_Surname}</div>
                    <div className='userCode' onClick={() => redirectProfile()}>@{userLogged.User_Name.toLowerCase() + userLogged.User_Surname.toLowerCase()}</div>
                </div>
            </div>}
            <div className='nav-top'>
                <div className='box'><NavLink to={"/home"}><FontAwesomeIcon className={"icon"} icon={faHouse}/> Home</NavLink></div>
                <div className='box'><NavLink to={"/trends"}><FontAwesomeIcon className={"icon"} icon={faFire}/> Trends</NavLink></div>
                {!userLogged && <div className='box'><NavLink to={"/channels"}><FontAwesomeIcon className={"icon"} icon={faClapperboard}/> Channels</NavLink></div>}
                {userLogged && <>
                    <div className='box'><NavLink to={"/subscriptions"}><FontAwesomeIcon className={"icon"} icon={faClapperboard}/> Subscriptions</NavLink></div>
                    <div className='box'><NavLink to={"/historic"}><FontAwesomeIcon className={"icon"} icon={faRotateLeft}/> Historic</NavLink></div>
                    <div className='box'><NavLink to={"/playlists"}><FontAwesomeIcon className={"icon"} icon={faPlay}/> Playlists</NavLink></div>
                </>}
                <TopTags/>
            </div>
            <div className='nav-bottom'>
                {userLogged && <>
                    <div className='box'><NavLink to={"/studio"}><FontAwesomeIcon className={"icon"} icon={faVideo}/> Studio</NavLink></div>
                    <div className='box'><NavLink to={"/settings"}><FontAwesomeIcon className={"icon"} icon={faGear}/> Settings</NavLink></div>
                    {(userLogged.User_Adm === 1) && <div className='box'><NavLink to={"/backOffice"}><FontAwesomeIcon className={"icon"} icon={faBuilding}/> BackOffice</NavLink></div>}
                    <div className='box' onClick={() => logoutUser()}><span className='logout'><FontAwesomeIcon className={"icon"} icon={faRightFromBracket}/> Terminar sessão</span> </div>
                </>}
            </div>
        </div>
    </nav>;
}

export default Navigation;