import "./Trends.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import axios from "axios";
import Video from "../../blocks/Video/Video";
import HottestChannel from "../../blocks/HottestChannel/HottestChannel";
import {faBars, faGear} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useHistory} from "react-router-dom";
import React from "react";

function Trends() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const {userLogged, setCurrentPage} = useLogged();
    const [tendencies, setTendencies] = useState(null);
    const [tendencies_channels, setTendencies_channels] = useState(0);
    const [showMore, setShowMore] = useState(false);
    const [filterType, setFilterType] = useState('views');

    useEffect(() => {
        setCurrentPage('tendency');
    }, []);

    useEffect(() => {
        axios.get(`${API_URL}/tendencies/list`)
            .then(response => setTendencies(response.data));
        if(filterType === 'views') {
            axios.get(`${API_URL}/tendencies/channel_views`)
                .then(response => setTendencies_channels(response.data));
        } else if (filterType === 'likes') {
            axios.get(`${API_URL}/tendencies/channel_likes`)
                .then(response => setTendencies_channels(response.data));
        } else if (filterType === 'followers') {
            axios.get(`${API_URL}/tendencies/channel_followers`)
                .then(response => setTendencies_channels(response.data));
        }
    }, [filterType]);

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(!open);
    };

    const handleType = (value) => {
        console.log(value);
        setFilterType(value);
        setOpen(false);
    };

    return <div className="Trends">
        <div className='main'>
            <div>
                <h1 className={"title_trends"}>Tendencies</h1>
            </div>
            <div className={"videos"}>
                {!tendencies && <p>A carregar</p>}
                {tendencies && <>
                    {tendencies.length === 0 && <p>Sem resultados</p>}
                    {tendencies.map(v => <Video
                        key={v.Video_ID}
                        page={"playlistPage"}
                        userId={v.User_ID}
                        userName={v.userName}
                        photo={v.User_Photo}
                        videoId={v.Video_ID}
                        title={v.Video_Title}
                        duration={v.Video_Duration}
                        cover={v.Video_Thumbnail}
                        days={v.Video_Post_Date}
                        open={false}
                    />)}
                </>}
            </div>
        </div>
        <div className='aside'>
            <div className={"channel_aside"}>
                <div className={"channel_header"}>
                    <h3>Canais Sugeridos</h3>
                    <div className="dropdown">
                        <button className={"dots"} onClick={handleOpen}><FontAwesomeIcon className={"gear"} icon={faBars}/></button>
                        {open ? (<ul className="menu">
                            <li className="menu-item">
                                <button onClick={() => handleType('views')}>Views</button>
                            </li>
                            <li className="menu-item">
                                <button onClick={() => handleType('followers')}>Followers</button>
                            </li>
                            <li className="menu-item">
                                <button onClick={() => handleType('likes')}>Likes</button>
                            </li>
                        </ul>) : null}
                    </div>
                </div>
                {!tendencies_channels && <p>A carregar</p>}
                {tendencies_channels && <>
                    {tendencies_channels?.length === 0 && <p>Sem resultados</p>}
                    {showMore ? tendencies_channels.map(tc => <HottestChannel
                            key={tc.User_ID}
                            page={"tendencies"}
                            channelId={tc.User_ID}
                            userPhoto={tc.User_Photo}
                            userName={tc.User_Name}
                        />)
                        :
                        tendencies_channels.slice(0,1).map(tc => <HottestChannel
                            key={tc.User_ID}
                            page={"tendencies"}
                            channelId={tc.User_ID}
                            userPhoto={tc.User_Photo}
                            userName={tc.User_Name}
                        />)}
                    <div className={"channel_bottom_box"}>
                        <button className="btn" onClick={() => setShowMore(!showMore)}>MOSTRAR MAIS</button>
                    </div>
                </>}
            </div>
        </div>
    </div>
}

export default Trends;