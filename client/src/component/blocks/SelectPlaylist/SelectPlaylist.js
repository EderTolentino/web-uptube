import "./SelectPlaylist.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLock, faGlobe, faCheck} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import axios from "axios";

function SelectPlaylist(props) {
    const toggleExist = async () => {
        if(props.exist) {
            const deleteVideo = {
                videoId: props.videoId,
                playlistId: props.playlistId
            }
            try {
                axios.post('http://localhost:3001/video_playlist/delete', deleteVideo).then((res) => {
                    console.log(res.data);
                });
                await props.refresh();
            } catch (err) {
                console.log(err);
            }
        }
        else {
            const addVideo = {
                videoId: props.videoId,
                playlistId: props.playlistId
            }
            try {
                axios.post('http://localhost:3001/video_playlist/add', addVideo).then((res) => {
                    console.log(res.data);
                });
                await props.refresh();
            } catch (err) {
                console.log(err);
            }
        }
    }

    return <div className={"SelectPlaylist"} onClick={e=>e.stopPropagation()}>
        <div className='select' onClick={() => toggleExist()}>{props.exist ? <FontAwesomeIcon className={"check"} icon={faCheck}/> : ''}</div>
        <div className='playlist_name'>{props.name}</div>
        <div className='playlist_privacy'>
            {props.private ? <FontAwesomeIcon className={"lock"} icon={faLock}/> : <FontAwesomeIcon className={"globe"} icon={faGlobe}/>}
        </div>
    </div>;
}

export default SelectPlaylist;