import "./SettingPlaylist.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import React from 'react'
import axios from "axios";
import {useHistory} from "react-router-dom";
import Video from "../../blocks/Video/Video";
import ScrollContainer from "react-indiana-drag-scroll";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";

function SettingPlaylist() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    let history = useHistory();
    const {userLogged} = useLogged();

    // GET THE PLAYLIST ID IN THE SEARCH PARAM IN THE URL
    let urlParams = new URLSearchParams(window.location.search);
    let playlistId = urlParams.get('p');

    const [playlistInformation, setPlaylistInformation] = useState(null);
    const [videosPlaylist, setVideosPlaylist] = useState(null);
    const [updateName, setUpdateName] = useState(null);
    const [updatePlaylistThumbnail, setUpdatePlaylistThumbnail] = useState(null);
    const [deletePopUp, setDeletePopUp] =useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/playlist/current_info`, {params: {Playlist_ID: playlistId}})
            .then(response => setPlaylistInformation(response.data[0]));

        axios.get(`${API_URL}/video_playlist/watching`, {params: {Playlist_ID: playlistId}})
            .then(response => setVideosPlaylist(response.data));

    }, []);

    const refreshPage = async () => {
        await axios.get(`${API_URL}/playlist/current_info`, {params: {Playlist_ID: playlistId}})
            .then(response => setPlaylistInformation(response.data[0]));

        await axios.get(`${API_URL}/video_playlist/watching`, {params: {Playlist_ID: playlistId}})
           .then(response => setVideosPlaylist(response.data));
    }

    const togglePrivacy = async (current) => {
        let updateInput = {};
        if(current === null) {
            updateInput = {
                playlistId: playlistId,
                playlistPrivacy: 1
            }
        } else if (current === 1) {
            updateInput = {
                playlistId: playlistId,
                playlistPrivacy: null
            }
        }

        axios.post(`${API_URL}/playlist/update_privacy`, updateInput, {
            withCredentials: true
        })
            .then((res) => {
                console.log('OKKK');
            }).catch((error) => {
            console.log(error)
        });
        await refreshPage();
    }

    let handleSubmit = async (e) => {
        e.preventDefault();

        if(updateName) {
            let updateInput = {
                playlistId: playlistId,
                playlistName: updateName
            }
            axios.post(`${API_URL}/playlist/update_name`, updateInput, {
                withCredentials: true
            })
                .then((res) => {
                    console.log('OKKK');
                }).catch((error) => {
                console.log(error)
            });
        }

        if(updatePlaylistThumbnail) {
            const formDataCover = new FormData();
            formDataCover.append("photo", updatePlaylistThumbnail);

            axios.post(`${API_URL}/playlist/update_thumbnail`, formDataCover, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((res) => {
                    console.log('OK');
                }).catch((error) => {
                console.log(error)
            });
        }
        await refreshPage();
    }

    const toggleDeletePopUp = () => {
        setDeletePopUp(!deletePopUp)
    }

    const deletePlaylist = async () => {
        let updateInput = {
            playlistId: playlistId
        }
        axios.post(`${API_URL}/playlist/delete`, updateInput, {
            withCredentials: true
        })
            .then((res) => {
                console.log('OKKK');
            }).catch((error) => {
            console.log(error)
        });

        history.replace(`/profile/${userLogged.User_ID}`);
    }

    const formatDuration = (duration) => {
        if (duration) {
            return (duration[0] === '0' && duration[1] === '0') ? duration.slice(3) : duration
        } else {
            return ('00:00');
        }
    }

    const removeVideoPlaylist = async (video) => {
        let updateInput = {
            playlistId: playlistId,
            videoId: video
        }
        axios.post(`${API_URL}/video_playlist/delete`, updateInput, {
            withCredentials: true
        })
            .then((res) => {
                console.log('OKKK');
            }).catch((error) => {
            console.log(error)
        });
        await refreshPage();
    }

    return <div className="SettingPlaylist">
        {!playlistInformation && <p>A carregar...</p>}
        {playlistInformation && <>
            {playlistInformation.length === 0 && <p>Sem resultados</p>}
            <div className='main'>
                <h1>Configurações da playlist</h1>
                <hr></hr>
                <form className='form' onSubmit={handleSubmit}>
                    <div className="inputContainer">
                        <h2>Alterar o nome:</h2>
                        <label>Editar nome:</label>
                        <input type="text" defaultValue={playlistInformation.Playlist_Name} name="title"
                               onChange={e => setUpdateName(e.target.value)}/>
                    </div>
                    <hr></hr>
                    <div className="inputContainer">
                        <h2>Alterar a thumbnail:</h2>
                        <div className='thumbnail-box'>
                            <div className='current-thumbnail' style={{ backgroundImage: `url(${playlistInformation.Playlist_Thumbnail})`}}></div>
                            <div className='new-thumbnail'>
                                <label>Escolha uma foto</label>
                                <input type="file" name="cover" accept="image/png, image/jpeg"
                                       onChange={e => setUpdatePlaylistThumbnail(e.target.files[0])}/>
                            </div>
                        </div>
                    </div>
                    <div className='submit-box'>
                        <button type="submit">Gravar Alterações</button>
                    </div>
                </form>
                <hr></hr>

                <div className="inputContainer">
                    <h2>Alterar a privacidade:</h2>
                    <div className='privacy-box'>
                        <div>Privacidade atual: {(playlistInformation.Private === null) ? 'Pública' : 'Privada'}</div>
                        <div className='toggle-privacy' onClick={() => togglePrivacy(playlistInformation.Private)}>
                            {(playlistInformation.Private === null) ? 'Tornar privado' : 'Tornar público'}
                        </div>
                    </div>
                </div>
                <hr></hr>

                <div className='delete-video-playlist'>
                    <h2>Remover vídeo da playlist:</h2>
                    <ScrollContainer className={"playlists-scroll-container"}>
                        {!videosPlaylist && <p>A carregar...</p>}
                        {videosPlaylist && <>
                            {videosPlaylist.length === 0 && <p>Sem resultados</p>}
                            {videosPlaylist.map(p => {
                                return <div className='edit-video'>
                                    <Video
                                        key={p.Video_Playlist_ID}
                                        page={"playlistPage"}
                                        cover={p.Video_Thumbnail}
                                        videoId={p.Video_ID}
                                        title={p.Video_Title}
                                        duration={formatDuration(p.Video_Duration)}
                                        open={p.Playlist_ID}
                                    />
                                    <div className='hide' onClick={() => removeVideoPlaylist(p.Video_ID)}><FontAwesomeIcon className='hidden-icon' icon={faXmark}/></div>
                                </div>
                            })}
                        </>}
                    </ScrollContainer>
                </div>
                <hr></hr>
                <div className='delete-profile'>
                    <h2>Deletar a playlist:</h2>
                    <div className='delete' onClick={() => toggleDeletePopUp()}>DELETAR PLAYLIST</div>
                </div>
                {deletePopUp && <div onClick={() => toggleDeletePopUp()} className='send_area'>
                    <div className='buttons'>
                        <div className='cancel' onClick={() => toggleDeletePopUp()}>CANCELAR</div>
                        <div className='send' onClick={() => deletePlaylist()}>EXCLUIR PLAYLIST</div>
                    </div>
                </div>}
            </div>}
        </>}
    </div>
}

export default SettingPlaylist;
