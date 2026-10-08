import "./Video.scss"

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBookmark, faThumbsUp, faMessage} from "@fortawesome/free-regular-svg-icons"
import {faPlay, faGear, faShareNodes, faGlobe, faPlus} from "@fortawesome/free-solid-svg-icons";
import {Link, useHistory} from "react-router-dom";
import React, {useState} from "react";
import {useLogged} from "../../../providers/isLogged";
import axios from "axios";
import {useForm} from "react-hook-form";
import {Button} from "react-bootstrap";
import SelectPlaylist from "../SelectPlaylist/SelectPlaylist";
import Share from "../Share/Share";

function Video(props) {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {userLogged, checkAchievements} = useLogged();
    let history = useHistory();

    const {register, handleSubmit, formState, watch, reset} = useForm();
    // The register of the hook useForm replaces the input name
    const [playlistName] = watch(["playlist_name"]);

    const createPlaylist = async (values) => {
        const createPlaylist = {
            playlistName: values.playlist_name,
            private: values.private
        }
        try {
            axios.post(`${API_URL}/playlist/create`, createPlaylist, {
                withCredentials: true
            }).then((res) => {
                console.log(res.data);
            });

            reset(formValues => ({
                ...formValues,
                playlist_name: '',
                private: '',
            }))
            await refreshPlaylists();
        } catch (err) {
            console.log(err);
        }
    }

    let tagList = "#" + props.tags
    tagList = tagList.replace(', ', ' #');
    tagList = tagList.split(' ');

    const today = new Date();
    const diffInMs = new Date(today) - new Date(props.days)
    let diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    diffInDays = Math.floor(diffInDays);

    const addView = async () => {
        console.log(props.videoId);
        await axios.post(`${API_URL}/view/add`, {videoId: props.videoId}).then((res) => {
            console.log(res.data);
        });
    }

    const watchVideo = async () => {
        if(props.open){
            history.replace(`/watch?v=${props.videoId}&p=${props.open}`);
            // ADD HERE ONE MORE VIEW FOR THIS VIDEO
            await addView();
            await checkAchievements(props.userId);
        } else {
            history.replace(`/watch?v=${props.videoId}`);
            // ADD HERE ONE MORE VIEW FOR THIS VIDEO
            await addView();
            // ADICIONAR ID
            await checkAchievements();
        }
    }

    const [popUp, setPopUp] = useState(false);
    const [sharePopUp, setSharePopUp] = useState(false);
    const [playlists, setPlaylists] = useState(null);
    let checker = [];
    let userPlaylists = [];
    let videoPlaylists = [];

    const refreshPlaylists = async () => {
        checker = [];
        userPlaylists = [];
        videoPlaylists = [];

        // LOAD THE LIST OF PLAYLIST OF THIS USER
        await axios.get(`${API_URL}/video_playlist/list`, {
            withCredentials: true
        })
            .then(response => setPlaylists(response.data));
    }

    const togglePopUp = async () => {
        await refreshPlaylists();
        setPopUp(!popUp);
    }

    if(playlists) {
        playlists.map(p => {
            if(!checker.includes(p.Playlist_Name)) {
                checker.push(p.Playlist_Name)
                userPlaylists.push({Playlist_ID: p.Playlist_ID, Playlist_Name: p.Playlist_Name, Private: p.Private})
            }
            if(p.Video_ID === props.videoId && !videoPlaylists.includes(p.Playlist_Name)) {
                videoPlaylists.push(p.Playlist_Name);
            }
        })
    }

    const [addPlaylist, setAddPlaylist] = useState(false);
    const openForm = () => {
        setAddPlaylist(true);
    }

    const toggleSharePopUp = () => {
        setSharePopUp(!sharePopUp);
    }

    const addViewChannel = async () => {
        await axios.post(`${API_URL}/view/channel`, {channelId: props.userId}).then((res) => {
            console.log(res.data);
        });
    }

    const redirectProfile = async () => {
        history.replace(`/profile/${props.userId}`);
        await addViewChannel();
    }

    const openEdition = (page) => {
        if(page === 'upload') {
            history.replace(`/settingVideo?v=${props.videoId}`);
        } else if(page === 'playlist') {
            history.replace(`/settingPlaylist?p=${props.playlistId}`);
        }
    }

    return <div className={"Video"}>
        <div className='cover-box'>
            <div className={"cover"} onClick={() => watchVideo()} style={{ backgroundImage: `url(${props.cover})` }}>
                {["upload", "home", "playlistPage", "results", "historic"].includes(props.page) && <div className='duration'>
                    {(props.duration[0] === '0' && props.duration[1] === '0') ? props.duration.slice(3) : props.duration}
                </div>}
                {["playlistPage"].includes(props.page) && <div className='duration'>
                    {props.duration}
                </div>}
                {props.page === "playlist" &&
                    <div className='player'>
                        <div className='container'>
                            <FontAwesomeIcon className={"book_play"} icon={faBookmark}/>
                            <FontAwesomeIcon className={"play"} icon={faPlay}/>
                        </div>
                    </div>
                }
            </div>
            {["home", "playlist", "historic"].includes(props.page) && <div className={"photo"} onClick={() => redirectProfile()} style={{ backgroundImage: `url(${props.photo})` }}></div>}
        </div>
        {["upload", "results"].includes(props.page) && <div className={"description"}>
            <div className='tag-list'>
                {tagList && tagList.map(t => {
                    return <Link key={t} className={"user"} to={`/relatedTags?tag=${t.replace('#', '')}`}>{t}</Link>
                })}
            </div>
            <h1 onClick={() => watchVideo()}>{props.title}</h1>
            <div className='setting' onClick={() => watchVideo()}>
                <h3 onClick={() => watchVideo()}>{props.views ? props.views : 0} visualizações | há {diffInDays} dias</h3>

            </div>
        </div>}
        {props.page === "upload" && <FontAwesomeIcon onClick={() => openEdition('upload')} className={"gear"} icon={faGear}/>}
        {["home", "playlist", "historic"].includes(props.page) && <div className={"description"} onClick={() => watchVideo()}>
            <Link className={"tags"} to={"/Home"}>{props.userName}</Link>
            <h1>{props.title}</h1>
            {(props.page === 'playlist') &&<div className='setting'>
                <h3>Duração total: {(props.duration[0] === '0' && props.duration[1] === '0') ? props.duration.slice(3) : props.duration} | há {diffInDays} dias</h3>
            </div>}
            {(props.page === 'home') && <h3 onClick={() => watchVideo()}>{props.views ? props.views : 0} visualizações | há {diffInDays} dias</h3>}
        </div>}
        {props.page === "playlistPage" && <div className={"playlist-title"} onClick={() => watchVideo()}>
            <h1>{props.title}</h1>
        </div>}
        {props.page === "playlist" && <FontAwesomeIcon onClick={() => openEdition('playlist')} className={"gear"} icon={faGear}/>}

        {["home"].includes(props.page) &&
            <div className={"information"}>
                <div className='left'>
                    <div className={"comments"}>
                        <FontAwesomeIcon className={"icons"} icon={faMessage}/>
                        <h4>{props.comments > 0 ? props.comments : 0} Comentários</h4>
                    </div>
                    <div className={"likes"}>
                        <FontAwesomeIcon className={"icons"} icon={faThumbsUp}/>
                        <h4>{props.likes > 0 ? props.likes : 0} likes</h4>
                    </div>
                </div>
                <div className={"add-and-share"}>
                    {props.page === "home" && userLogged && <div className='add-playlist' onClick={() => togglePopUp()}>
                        <FontAwesomeIcon className={"icons"} icon={faBookmark}/>
                    </div>}
                    {props.page === "home" && <div className='forward-link' onClick={() => toggleSharePopUp()}>
                        <FontAwesomeIcon className={"icons"} icon={faShareNodes}/>
                    </div>}
                </div>
                {sharePopUp && <div className='wrapper-share' onClick={() => toggleSharePopUp()}>
                    <div className='share-popup' onClick={e=>e.stopPropagation()}>
                        <div className='share-box'><Share videoId={props.videoId}/></div>
                    </div>
                </div>}
            </div>
        }
        {popUp && <div className='wrapper-add-playlist' onClick={() => togglePopUp()}>
            <div className='playlist-popup' onClick={e=>e.stopPropagation()}>
                <h5>Adicionar à...</h5>
                {userPlaylists.map(p => <SelectPlaylist
                    key={p.Playlist_ID + props.videoId}
                    playlistId={p.Playlist_ID}
                    name={p.Playlist_Name}
                    private={p.Private}
                    videoId={props.videoId}
                    exist={videoPlaylists.includes(p.Playlist_Name)}
                    refresh={refreshPlaylists}
                />)}
                {addPlaylist ?
                    (<div className='add-playlist-box' onClick={e=>e.stopPropagation()}>
                        <form className={"create_playlist"} onSubmit={handleSubmit(createPlaylist)}>
                            <p>Nome</p>
                            <input className={"playlist_name" + (formState.errors["playlist_name"] ? "input-error" : '')}
                                   placeholder="Nome da playlist"
                                   {...register("playlist_name", {
                                       required: "Obrigatório preencher",
                                       minLength: {value: 5, message: "Mínimo 5 caracteres"},
                                       maxLength: {value: 20, message: "Mínimo 20 caracteres"}
                                   })}/>
                            <p className='count'>{(playlistName) ? playlistName?.length : 0}/20</p>
                            {formState.errors["playlist_name"] && <span>{formState.errors["playlist_name"].message}</span>}

                            <p>Privacidade</p>
                            <select className={"playlist_private" + (formState.errors["private"] ? "input-error" : '')}
                                    {...register("private", {
                                        required: "Obrigatório escolher privacidade"
                                    })}>
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>
                            <Button className='create-btn' type={"submit"}>Criar</Button>
                        </form>
                    </div>)
                    : ( <div className='button-box' onClick={e=>e.stopPropagation()}>
                        <div className='button-plus' onClick={() => openForm()}>
                            <FontAwesomeIcon className='plus' icon={faPlus}/>
                            <span>Criar playlist</span>
                        </div>
                    </div>)}
            </div>
        </div>}
    </div>;
}

export default Video;

