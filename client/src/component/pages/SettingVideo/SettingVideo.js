import "./SettingVideo.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import React from 'react'
import axios from "axios";
import {useHistory} from "react-router-dom";

function SettingVideo() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    // GET THE VIDEO ID IN THE SEARCH PARAM IN THE URL
    let urlParams = new URLSearchParams(window.location.search);
    let videoId = urlParams.get('v');

    const [videoInformation, setVideoInformation] = useState(null);
    const [updateTitle, setUpdateTitle] = useState(null);
    const [updateCover, setUpdateCover] = useState(null);
    const [updateDescription, setUpdateDescription] = useState(null);
    const [deletePopUp, setDeletePopUp] =useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/video/current_info`, {params: {videoId: videoId}}).then(
            response => setVideoInformation(response.data[0])
        )

    }, []);

    const refreshPage = async () => {
        await axios.get(`${API_URL}/video/current_info`, {params: {videoId: videoId}}).then(
            response => setVideoInformation(response.data[0])
        )
    }

    const togglePrivacy = async (current) => {
        let updateInput = {};
        if(current === null) {
            updateInput = {
                videoId: videoId,
                videoPrivacy: 1
            }
        } else if (current === 1) {
            updateInput = {
                videoId: videoId,
                videoPrivacy: null
            }
        }

        axios.post(`${API_URL}/video/update_privacy`, updateInput, {
            withCredentials: true
        })
            .then((res) => {
                console.log('OK');
            }).catch((error) => {
            console.log(error)
        });
        await refreshPage();
    }

    let handleSubmit = async (e) => {
        e.preventDefault();

        if(updateTitle) {
            let updateInput = {
                videoId: videoId,
                videoTitle: updateTitle
            }
            axios.post(`${API_URL}/video/update_title`, updateInput, {
                withCredentials: true
            })
                .then((res) => {
                    console.log('OKKK');
                }).catch((error) => {
                console.log(error)
            });
        }

        if(updateDescription) {
            let updateInput = {
                videoId: videoId,
                videoDescription: updateDescription
            }
            axios.post(`${API_URL}/video/update_description`, updateInput, {
                withCredentials: true
            })
                .then((res) => {
                    console.log('OK');
                }).catch((error) => {
                console.log(error)
            });
        }

        if(updateCover) {
            const formDataCover = new FormData();
            formDataCover.append("photo", updateCover);

            axios.post(`${API_URL}/video/${videoId}/update_thumbnail`, formDataCover, {
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

    const deleteVideo = () => {

        axios.post(`${API_URL}/video/delete`, {videoId: videoInformation.Video_ID}, {
            withCredentials: true
        })
            .then((res) => {
                console.log('OKKK');
            }).catch((error) => {
            console.log(error)
        });
    }

    return <div className="SettingVideo">
        {!videoInformation && <p>A carregar...</p>}
        {videoInformation && <>
            {videoInformation.length === 0 && <p>Sem resultados</p>}
            <div className='main'>
                <h1>Configurações do video</h1>
                <hr></hr>
                <form className='form' onSubmit={handleSubmit}>
                    <div className="inputContainer">
                        <h2>Alterar o título:</h2>
                        <label>Editar título:</label>
                        <input type="text" defaultValue={videoInformation.Video_Title} name="title"
                               onChange={e => setUpdateTitle(e.target.value)}/>
                    </div>
                    <hr></hr>
                    <div className="inputContainer">
                        <h2>Alterar a descrição:</h2>
                        <label>Editar descrição:</label>
                        <textarea type="text" defaultValue={videoInformation.Video_Description} name="description"
                                  onChange={e => setUpdateDescription(e.target.value)}/>
                    </div>
                    <hr></hr>
                    <div className="inputContainer">
                        <h2>Alterar a thumbnail:</h2>
                        <div className='thumbnail-box'>
                            <div className='current-thumbnail' style={{ backgroundImage: `url(${videoInformation.Video_Thumbnail})`}}></div>
                            <div className='new-thumbnail'>
                                <label>Escolha uma foto</label>
                                <input type="file" name="cover" accept="image/png, image/jpeg"
                                       onChange={e => setUpdateCover(e.target.files[0])}/>
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
                        <div>Privacidade atual: {(videoInformation.Private === null) ? 'Público' : 'Privado'}</div>
                        <div className='toggle-privacy' onClick={() => togglePrivacy(videoInformation.Private)}>
                            {(videoInformation.Private === null) ? 'Tornar privado' : 'Tornar público'}
                        </div>
                    </div>
                </div>
                <hr></hr>
                <div className='delete-profile'>
                    <h2>Deletar o vídeo:</h2>
                    <div className='delete' onClick={() => toggleDeletePopUp()}>DELETAR VÍDEO</div>
                </div>
                {deletePopUp && <div onClick={() => toggleDeletePopUp()} className='send_area'>
                    <div className='buttons'>
                        <div className='cancel' onClick={() => toggleDeletePopUp()}>CANCELAR</div>
                        <div className='send' onClick={() => deleteVideo()}>EXCLUIR VIDEO</div>
                    </div>
                </div>}
            </div>}
        </>}
    </div>
}

export default SettingVideo;
