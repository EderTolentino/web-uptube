import "./Home.scss"
import {useEffect, useState} from "react";
import axios from "axios";
import Video from "../../blocks/Video/Video";
import {useLogged} from "../../../providers/isLogged";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import HottestChannel from "../../blocks/HottestChannel/HottestChannel";
import React from "react";

function Home() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const {setCurrentPage, filter} = useLogged();
    const [videos, setVideos] = useState(null);
    const [tendencies, setTendencies] = useState(null);
    const [tendencies_channels, setTendencies_channels] = useState(0);
    const [showMore, setShowMore] = useState(false);
    const [filterType, setFilterType] = useState('views');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setCurrentPage('home');
        axios.get(`${API_URL}/video/all`, {params: {search: filter}})
            .then(response => setVideos(response.data));
    }, [filter]);


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

    const handleOpen = () => {
        setOpen(!open);
    };

    const handleType = (value) => {
        setFilterType(value);
        setOpen(false);
    };

    return <div className={"Home"}>
        <div className='main'>
            <div className={"suggested_videos"}>
                <h1>Videos Sugeridos</h1>
            </div>
            <div className={"videos"}>
                {!videos && <p>A carregar</p>}
                {videos && <>
                    {videos.length === 0 && <p>Sem resultados</p>}
                    {videos.map(v => <Video
                        key={v.Video_ID}
                        page={"home"}
                        userId={v.User_ID}
                        userName={v.userName}
                        photo={v.User_Photo}
                        videoId={v.Video_ID}
                        title={v.Video_Title}
                        duration={v.Video_Duration}
                        cover={v.Video_Thumbnail}
                        tags={v.tags}
                        views={v.views}
                        comments={v.comments}
                        likes={v.likes}
                        days={v.Video_Post_Date}
                        open={false}
                        general={v.tags}
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

export default Home;
