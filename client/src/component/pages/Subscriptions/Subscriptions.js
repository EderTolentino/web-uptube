import "./Subscriptions.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect} from "react";
import axios from "axios";
import {useHistory} from "react-router-dom";
import {useState} from "react";
import Video from "../../blocks/Video/Video";

function Subscriptions() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const {setCurrentPage} = useLogged();
    const [lastVideos, setLastVideos] = useState(null);

    useEffect(() => {
        setCurrentPage('subscriptions');

        axios.get(`${API_URL}/interaction/videos_subscriptions`)
            .then(response => setLastVideos(response.data));

    }, []);

    return <div className="Subscriptions">
            <div className='main'>
                <div className={"suggested_videos"}>
                    <h1>Vídeos recentes dos teus canais favoritos</h1>
                </div>
                {!lastVideos && <p>A carregar</p>}
                {lastVideos && <div className='video-box'>
                    {lastVideos.length === 0 && <p>Sem resultados</p>}
                    {lastVideos.map(v => <Video
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

export default Subscriptions;