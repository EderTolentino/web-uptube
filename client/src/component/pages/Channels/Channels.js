import "./Channels.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import axios from "axios";
import Video from "../../blocks/Video/Video";
import {useHistory} from "react-router-dom";

function Channels() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const {setCurrentPage} = useLogged();
    const [videos, setVideos] = useState(null);

    useEffect(() => {
        setCurrentPage('channels');

        axios.get(`${API_URL}/channels/top_channels`)
            .then(response => setVideos(response.data));

    }, []);

    return <div className="Channels">
        <div className='main'>
            <div className={"suggested_videos"}>
                <h1>Videos dos canais mais visualizados</h1>
            </div>
            {!videos && <p>A carregar</p>}
            {videos && <div className='video-box'>
                {videos.length === 0 && <p>Sem resultados</p>}
                {videos.map(v => <Video
                    key={v.Video_ID}
                    page={"historic"}
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
            </div>}
        </div>
    </div>
}

export default Channels;
