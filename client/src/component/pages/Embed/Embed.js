import "./Embed.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect} from "react";
import ReactPlayer from "react-player";
import React from "react";
import {useParams} from "react-router-dom";

function Embed() {
    const {setCurrentPage} = useLogged();
    const {video_id} = useParams();
    useEffect(() => {
        setCurrentPage('embed');
    }, []);

    return <div className="Embed">
        <div className='main'>
            <ReactPlayer
                className={"react-player"}
                width={'100vw'} height={'100vh'}
                playing
                controls
                url={`http://localhost:3001/video/${video_id}.mp4`}
            />
        </div>
    </div>
}

export default Embed;