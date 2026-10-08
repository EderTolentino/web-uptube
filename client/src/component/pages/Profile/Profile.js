import "./Profile.scss";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import Video from "../../blocks/Video/Video";
import Achievement from "../../blocks/Achievements/Achievements";
import {useLogged} from "../../../providers/isLogged";
import CoverProfile from "../../blocks/CoverProfile/CoverProfile";
import Subscriptions from "../../blocks/Subscriptions/Subscriptions";
import About from "../../blocks/About/About";
import {faEye, faEyeSlash, faPenToSquare} from "@fortawesome/free-regular-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// https://www.npmjs.com/package/react-scroll-horizontal
import ScrollContainer from 'react-indiana-drag-scroll';
import React from "react";

function Profile() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const {userLogged, setCurrentPage, filter} = useLogged();
    const [videos, setVideos] = useState(null);
    const [playlists, setPlaylists] = useState(null);
    const [shared, setShared] = useState(null);
    const [achievements, setAchievements] = useState(null);
    const [subscriptions, setSubscriptions] = useState(null);
    const [about, setAbout] = useState(null);
    const [channelSettings, setChannelSettings] = useState(null);
    const [inEdition, setInEdition] = useState(false);

    // THIS CHANNEL ID WILL BE RECEIVED FROM THE URL PARAM
    // IT COMES FROM THE PROFILE PAGE WE HAVE BEING REDIRECTED
    const {channel_id} = useParams();

    useEffect(() => {
        setCurrentPage('profile');

        axios.get(`${API_URL}/user_settings/${channel_id}`)
            .then(response => setChannelSettings(response.data[0]));

        axios.get(`${API_URL}/interaction/${channel_id}/list`)
            .then(response => setAchievements(response.data));

        axios.get(`${API_URL}/interaction/subscriptions`)
            .then(response => setSubscriptions(response.data));

        axios.get(`${API_URL}/user/${channel_id}/about`)
            .then(response => setAbout(response.data[0]));
    }, []);


    const refreshPage = () => {
        window.location.reload();
    }

    useEffect(() => {
        axios.get(`${API_URL}/video/${channel_id}/list`, {params: {search: filter}})
            .then(response => setVideos(response.data));

        axios.get(`${API_URL}/playlist/${channel_id}/list`, {params: {search: filter}})
            .then(response => setPlaylists(response.data));

        axios.get(`${API_URL}/playlist_shared/${channel_id}/list`, {params: {search: filter}})
            .then(response => setShared(response.data));
    }, [filter]);

    const checkPlaylists = [];
    if(playlists) {
        console.log(playlists)
        playlists.map(p => {
            if(p.Playlist_Thumbnail !== "") {
                checkPlaylists.push(p.Playlist_Thumbnail);
            }
        })
    }

    if(shared) {
        shared.map(s => {
            if(s.Playlist_Thumbnail !== "") {
                checkPlaylists.push(s.Playlist_Thumbnail);
            }
        })
    }

    const editProfile = () => {
        setInEdition(!inEdition);
    }

    const [hideAchievements, setHideAchievements] = useState(null);
    const [hideUploads, setHideUploads] = useState(null);
    const [hidePlaylists, setHidePlaylists] = useState(null);

    useEffect(() => {
        if(channelSettings) {
            if(channelSettings.Hide_Achievements === 1)
                setHideAchievements(true);

            if(channelSettings.Hide_Uploads === 1)
                setHideUploads(true);

            if(channelSettings.Hide_Playlists === 1)
                setHidePlaylists(true);
        }
    }, [channelSettings]);

    if(channelSettings)
        console.log(channelSettings)

    const showAchievementsFunc = async () => {
        try {
            axios.post(`${API_URL}/user_settings/show_achievements`, {
                withCredentials: true
            }).then((res) => {
                console.log(res.data);
            });
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const hideAchievementsFunc = async () => {
        try {
            axios.post(`${API_URL}/user_settings/hide_achievements`, {
                withCredentials: true
            }).then((res) => {
                console.log(res.data);
            });
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const showUploadsFunc = async () => {
        try {
            axios.post(`${API_URL}/user_settings/show_uploads`, {
                withCredentials: true
            }).then((res) => {
                console.log(res.data);
            });
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const hideUploadsFunc = async () => {
        try {
            axios.post(`${API_URL}/user_settings/hide_uploads`, {
                withCredentials: true
            }).then((res) => {
                console.log(res.data);
            });
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const showPlaylistsFunc = async () => {
        try {
            axios.post(`${API_URL}/user_settings/show_playlists`, {
                withCredentials: true
            }).then((res) => {
                console.log(res.data);
            });
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const hidePlaylistsFunc = async () => {
        try {
            axios.post(`${API_URL}/user_settings/hide_uploads`, {
                withCredentials: true
            }).then((res) => {
                console.log('Comentário vindo do backend');
                console.log(res.data);
            });
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const refreshSettings = async () => {
        axios.get(`${API_URL}/user_settings/${channel_id}`)
            .then(response => setChannelSettings(response.data[0]));
    }

    if(!channel_id || !userLogged) {
        return <p>A carregar</p>
    } else {
        return <div className="Profile">
            <div className='main'>
                {!about && <p>A carregar</p>}
                {about && <>
                    {about.length === 0 && <p>Sem resultados</p>}
                    {about && <CoverProfile
                        key={about.User_ID}
                        User_Logged={userLogged.User_ID}
                        Channel_ID={channel_id}
                        Channel_Name={about.User_Name + ' ' + about.User_Surname}
                        Channel_Description={about.User_Description}
                        Channel_Photo={about.User_Photo}
                        Channel_Cover={about.User_Cover}
                        Channel_Videos={about.videos === null ? 0 : about.videos}
                        Channel_Subscribers={about.subscriptors === null ? 0 : about.subscriptors}
                        Channel_Views={about.views === null ? 0 : about.views}
                        editProfileFunc={editProfile}
                    />}
                </>}
                {(!hideAchievements || inEdition) && <div className='achievement-box'>
                    <h6 className={"achievement-title"}>Achievements</h6>
                    {inEdition && <div className='edit-profile' >
                        {hideAchievements && <FontAwesomeIcon className={"pencil"} onClick={() => showAchievementsFunc()} icon={faEye}/>}
                        {!hideAchievements && <FontAwesomeIcon className={"pencil"} onClick={() => hideAchievementsFunc()}icon={faEyeSlash}/>}
                    </div>}
                </div>}
                {!hideAchievements && <div className='achievement-list'>
                    {!achievements && <p>A carregar</p>}
                    {achievements && <>
                        {achievements.length === 0 && <p>Sem resultados</p>}
                        {achievements.map(a => <Achievement
                            key={a.Interaction_ID}
                            type={"unique"}
                            Achievement_Name={a.Achievement_Name}
                            Achievement_Item={`${API_URL}/achievement/${a.Achievement_Item}.png`}
                            edition={inEdition}
                            refreshPage={refreshPage}
                        />)}
                    </>}
                </div>}
                {(!hideUploads || inEdition) && <div className='upload-box'>
                    <h6 className={"upload-title"}>Uploads</h6>
                    {inEdition && <div className='edit-profile'>
                        {hideUploads && <FontAwesomeIcon className={"pencil"} onClick={() => showUploadsFunc()} icon={faEye}/>}
                        {!hideUploads && <FontAwesomeIcon className={"pencil"} onClick={() => hideUploadsFunc()} icon={faEyeSlash}/>}
                    </div>}
                </div>}
                {!hideUploads && <ScrollContainer className={"videos-scroll-container"}>
                    {!videos && <p>A carregar</p>}
                    {videos && <>
                        {videos.length === 0 && <p>Sem resultados</p>}
                        {videos.map(v => <Video
                            key={v.Video_ID}
                            page={"upload"}
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
                </ScrollContainer>}
                {(!hidePlaylists || inEdition) && <div className='playlist-box'>
                    <h6 className={"playlist-title"}>Playlists</h6>
                    {inEdition && <div className='edit-profile'>
                        {hidePlaylists && <FontAwesomeIcon className={"pencil"} onClick={() => showPlaylistsFunc()} icon={faEye}/>}
                        {!hidePlaylists && <FontAwesomeIcon className={"pencil"} onClick={() => hidePlaylistsFunc()} icon={faEyeSlash}/>}
                    </div>}
                </div>}
                {!hidePlaylists && <ScrollContainer className={'playlists-scroll-container'}>
                    {!playlists && <p>A carregar</p>}
                    {playlists && <>
                        {(playlists?.length === 0 && shared?.length === 0 || checkPlaylists.length === 0) &&
                            <p>Sem resultados</p>}
                        {playlists.map(p => {
                            if (p.duration !== null) {
                                return <Video
                                    key={p.Playlist_ID}
                                    playlistId={p.Playlist_ID}
                                    page={"playlist"}
                                    cover={p.Playlist_Thumbnail}
                                    userName={p.userName}
                                    tags={p.tags}
                                    general={p.userName}
                                    title={p.Playlist_Name}
                                    photo={p.User_Photo}
                                    days={p.Playlist_Post_Date}
                                    duration={p.duration}
                                    open={p.Playlist_ID}
                                />
                            }
                        })}
                    </>}

                    {shared && <>
                        {shared.map(s => {
                            if (s.Playlist_Thumbnail !== "") {
                                return <Video
                                    key={s.Playlist_Shared_ID}
                                    playlistId={s.Playlist_ID}
                                    page={"playlist"}
                                    photo={s.User_Photo}
                                    videoId={s.Video_ID}
                                    cover={s.Playlist_Thumbnail}
                                    userName={s.userName}
                                    tags={s.tags}
                                    general={s.userName}
                                    title={s.Playlist_Name}
                                    days={s.Playlist_Post_Date}
                                    duration={s.duration}
                                    open={s.Playlist_ID}
                                />
                            }
                        })}
                    </>}
                </ScrollContainer>}

                <div className='userInformation'>
                    {(channel_id.toString() === userLogged.User_ID.toString()) && <><div className='title'>Subscrições</div>
                        <div className='subscriptions'>
                            {!subscriptions && <p>A carregar</p>}
                            {subscriptions && <>
                                {subscriptions.length === 0 && <p>Sem resultados</p>}
                                {subscriptions.map(s => <Subscriptions
                                    key={s.Interaction_ID}
                                    interactionId={s.Interaction_ID}
                                    userId={s.User_ID}
                                    photo={s.User_Photo}
                                    channel={s.User_Name + ' ' + s.User_Surname}
                                    edition={inEdition}
                                    refresh={refreshPage}
                                />)}
                            </>}
                        </div></>}
                    <div className='title'>Acerca</div>
                    <div className='about'>
                        {!about && <p>A carregar</p>}
                        {about && <>
                            {about.length === 0 && <p>Sem resultados</p>}
                            {about && <About
                                key={about.User_ID}
                                date={about.User_Register_Date}
                                videos={about.videos === null ? 0 : about.videos}
                                playlists={about.playlists === null ? 0 : about.playlists}
                                subscriptors={about.subscriptors === null ? 0 : about.subscriptors}
                                views={about.views === null ? 0 : about.views}
                                edition={inEdition}
                            />}
                        </>}
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Profile;