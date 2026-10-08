import "./Watch.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import ReactPlayer from 'react-player';
import {Link} from "react-router-dom";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFlag, faShareNodes} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Comment from "../../blocks/Comment/Comment";
import CommentInput from "../../blocks/CommentInput/CommentInput";
import RadioReport from "../../blocks/RadioReport/RadioReport";
import LikeDislike from "../../blocks/LikeDislike/LikeDislike";
import Video from "../../blocks/Video/Video";
import {useHistory} from "react-router-dom";
import Share from "../../blocks/Share/Share";

function Watch() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    let history = useHistory();

    // GET THE VIDEO ID THAT IS IN THE SEARCH PARAM IN THE URL
    let urlParams = new URLSearchParams(window.location.search);
    let video_id = urlParams.get('v');
    let playlist_id = urlParams.get('p');

    const {setCurrentPage, userLogged} = useLogged();
    const [likeDislike, setLikeDislike] = useState(null);
    const [reportPopup, setReportPopup] = useState(false);
    const [comments, setComments] = useState(null);
    const [subscribed, setSubscribed] = useState(false);
    const [unsubscribe, setUnsubscribe] = useState(false);
    const [sharePopUp, setSharePopUp] = useState(false);
    const [playlists, setPlaylists] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const [videosChannel, setVideosChannel] = useState(null);
    const [forbiddenNewComment, setForbiddenNewComment] = useState(false)

    useEffect(() => {
        setCurrentPage('watch');
        axios.get(`${API_URL}/interaction/likes_list`, {params: {Video_ID: video_id}})
            .then(response => setLikeDislike(response.data));

        axios.get(`${API_URL}/interaction/comments`, {params: {Video_ID: video_id}})
            .then(response => setComments(response.data));

        axios.get(`${API_URL}/interaction/subscriptions`)
            .then(response => {
                if(response.data.length > 0) {
                    setSubscribed(true);
                }
            });

        axios.get(`${API_URL}/video_playlist/watching`, {params: {Playlist_ID: playlist_id}})
            .then(response => setPlaylists(response.data));

        axios.get(`${API_URL}/video/watching`, {params: {Video_ID: video_id}})
            .then(response => setVideoInfo(response.data[0]));

        axios.get(`${API_URL}/video/${video_id}/more_viewed`)
            .then(response => setVideosChannel(response.data));

    }, []);

    let numLikes = 0;
    let numDislikes = 0;
    if(videoInfo) {
        if(videoInfo.likes !== null)
            numLikes = videoInfo.likes;

        if(videoInfo.dislikes !== null)
            numDislikes = videoInfo.dislikes;
    }

    const handleEndedVideo = () => {
        const playlistVideos = [];
        if(playlists) {
            playlists.map(v => {
                playlistVideos.push(v.Video_ID);
            })
        }
        const playlistLength = playlistVideos.length;
        const playing = playlistVideos.indexOf(video_id);
        const next = playing + 1;
        if(next < playlistLength) {
            history.replace(`/watch?v=${playlistVideos[playing + 1]}&p=${playlist_id}`);
        }
    }

    let diffInDays = 0;
    let tags = '';
    if(videoInfo) {
        // FORMAT DATE
        const today = new Date();
        const diffInMs = new Date(today) - new Date(videoInfo.Video_Post_Date)
        diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        diffInDays = Math.floor(diffInDays);

        // FORMAT TAGS
        if(!videoInfo.tags)
            tags = "No tags for this video!";
        else {
            tags = "#" + videoInfo.tags
            tags = tags.replace(' ', '');
            tags = tags.replace(',', ' #');
        }
    }

    const insertingNewComment = async (values) => {
        try {
            await axios.post(`${API_URL}/interaction/insert_comment`, values).then((res) => {
                console.log('Comentário vindo do backend');
                console.log(res.data);
            });
            await refreshPage();
        } catch (err) {
            console.log(err);
        }

        await refreshPage();
    };

    const refreshPage = async () => {
        await axios.get(`${API_URL}/interaction/comments`, {params: {Video_ID: video_id}})
            .then(response => setComments(response.data));

        await axios.get(`${API_URL}/interaction/is_subscribed`, {params: {Video_ID: video_id}})
            .then(response => {
                if(response.data.length > 0) {
                    setSubscribed(true);
                } else {
                    setSubscribed(false);
                }
            });

        axios.get(`${API_URL}/video/watching`, {params: {Video_ID: video_id}})
            .then(response => setVideoInfo(response.data[0]));
    }

    const postLike = async (value) => {
        const inputLike = {
            like: value,
            Video_ID: video_id,
        }
        try {
            await axios.post(`${API_URL}/interaction/set_likes`, inputLike).then((res) => {
                setLikeDislike(res.data);
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
        await refreshPage();
    }

    const toggleReport = () => {
        setReportPopup(!reportPopup);
    }

    const handleSubscription = async () => {
        if(!subscribed) {
            const inputSubscription = {
                Video_ID: video_id
            }
            try {
                await axios.post(`${API_URL}/interaction/insert_subscription`, inputSubscription).then((res) => {
                    console.log(res.data);
                });
            } catch (err) {
                console.log(err);
            }
            await refreshPage();
        } else {
            setUnsubscribe(!unsubscribe);
        }
    }

    const cancelSubscription = async (value) => {
        if(value === 'cancel') {
            setUnsubscribe(false);
        } else {
            const inputSubscription = {
                Video_ID: video_id
            }
            try {
                await axios.post(`${API_URL}/interaction/delete_subscription`, inputSubscription).then((res) => {
                    console.log(res.data);
                });
            } catch (err) {
                console.log(err);
            }
            await refreshPage();
            setUnsubscribe(!unsubscribe);
        }
    }

    const addViewChannel = async (channel) => {
        await axios.post(`${API_URL}/view/channel`, {channelId: channel}).then((res) => {
            console.log(res.data);
        });
    }

    const redirectProfile = async (channel) => {
        history.replace(`/profile/${channel}`);
        await addViewChannel(channel);
    }

    const toggleShare = () => {
        setSharePopUp(!sharePopUp);
    }

    return <div className='Watch'>
        <div className='main'>
            <div className='screen'>
                <ReactPlayer
                    className={"react-player"}
                    width={'100%'} //height='100%'
                    playing
                    controls
                    url={`http://localhost:3001/video/${video_id}.mp4`}
                    onEnded={handleEndedVideo}
                />
            </div>
            <div className='videoInfo'>
                {!videoInfo && <p>A carregar</p>}
                {videoInfo && <Link className='tags' to={"/Home"}>{tags}</Link>}
                <div className='title'>
                    {!videoInfo && <p>A carregar</p>}
                    {videoInfo && <h3>{videoInfo.Video_Title}</h3>}
                    {userLogged && <div className='icons-box'>
                        <div className='forward-link' onClick={() => toggleShare()}>
                            <FontAwesomeIcon className={"icons"} icon={faShareNodes}/>
                        </div>
                        <div className='flag' onClick={() => toggleReport()}><FontAwesomeIcon icon={faFlag}/></div>
                    </div>}
                </div>
                {sharePopUp && <div className='wrapper-share' onClick={() => toggleShare()}>
                    <div className='share-popup' onClick={e=>e.stopPropagation()}>
                        <div className='share-box'><Share videoId={video_id}/></div>
                    </div>
                </div>}

                {reportPopup && <div onClick={() => toggleReport()} className='wrapper-report'>
                    <RadioReport
                        videoId={video_id}
                        submit={toggleReport}
                    />
                </div>}

                <div className='container_channel'>
                    {!videoInfo && <p>A carregar</p>}
                    {videoInfo && <div className='photo' onClick={() => redirectProfile(videoInfo.User_ID)} style={{ backgroundImage: `url(${videoInfo.User_Photo})` }}></div>}

                    <div className='data'>
                        <div className='channel'>
                            {!videoInfo && <p>A carregar</p>}
                            {videoInfo && <h3 className='user-name' onClick={() => redirectProfile(videoInfo.User_ID)}>{videoInfo.User_Name + ' ' + videoInfo.User_Surname}</h3>}
                            {!subscribed && userLogged && (videoInfo?.User_ID !== userLogged?.User_ID) && <div className='button' onClick={() => handleSubscription()}>subscrever</div>}
                            {subscribed && <div className='button' onClick={() => handleSubscription()}>subscrito</div>}
                        </div>
                        {unsubscribe && <div className='wrapper-subscription' onClick={() => cancelSubscription('cancel')}>
                            <div className='buttons'>
                                <div className='cancel' onClick={() => cancelSubscription('cancel')}>Cancelar</div>
                                <div className='send' onClick={() => cancelSubscription('removeSubscription')}>Remover</div>
                            </div>
                        </div>}
                        <div className='interaction'>
                            <div className='views'>
                                {!videoInfo && <p>A carregar</p>}
                                {videoInfo && <h3>{videoInfo.views ? videoInfo.views : 0} visualizações | há {diffInDays} dias</h3>}
                            </div>
                            {<LikeDislike
                                videoId={video_id}
                                likeDislike={likeDislike}
                                submit={postLike}
                                numLikes={numLikes}
                                numDislikes={numDislikes}
                            />}
                        </div>
                    </div>
                </div>

                <hr></hr>

                {userLogged && <> <CommentInput
                    interactionId={null}
                    video_id={video_id}
                    valueInput={''}
                    refreshFunc={refreshPage}
                    submitNewComment={insertingNewComment}
                    type={'new'}
                    setForbiddenNewComment={setForbiddenNewComment}
                />
                    {forbiddenNewComment && <p>HÁ PALAVRA PROIBIDA</p>}
                </>
                }

                {!comments && <p>A carregar</p>}
                {comments && <>
                    {comments.length === 0 && <p>Sem resultados</p>}
                    {comments.map(c => <Comment
                        key={c.Interaction_ID}
                        interactionId={c.Interaction_ID}
                        userId={c.User_ID}
                        photo={c.User_Photo}
                        user={c.User_Name + ' ' + c.User_Surname}
                        days={c.Interaction_Post_Date}
                        comment={c.Interaction_Text}
                        refreshFunc={refreshPage}
                    />)}
                </>}
            </div>
        </div>
        <div className='aside'>
            {playlist_id !== null && playlists && <div className='playlist'>
                <h2>{playlists[0].Playlist_Name}</h2>
                {playlists.map(p => <div className='playlist-playing' style={(p.Video_ID === video_id) ? ({ opacity: `0.3`, filter: 'saturate(1)'}) : ({ opacity: `1`})}>
                        <Video
                            key={p.Video_Playlist_ID}
                            page={"playlistPage"}
                            cover={p.Video_Thumbnail}
                            videoId={p.Video_ID}
                            title={p.Video_Title}
                            duration={p.Video_Duration}
                            open={p.Playlist_ID}
                        />
                    </div>
                )}
            </div>}
            {playlist_id === null && <div className='videos'>
                {!videosChannel && <p>A carregar</p>}
                {videosChannel && <>
                    {videosChannel?.length === 0 && <p>Sem resultados</p>}
                    {videosChannel.map(v => <div key={v.Video_ID} className='videos-playing' style={(v.Video_ID === video_id) ? ({ opacity: `0.3`, filter: 'saturate(1)'}) : ({ opacity: `1`})}>
                        <Video
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
                        />
                    </div>)}
                </>}
            </div>}
        </div>
    </div>
}

export default Watch;