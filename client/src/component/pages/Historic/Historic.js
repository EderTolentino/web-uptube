import "./Historic.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import axios from "axios";
import Video from "../../blocks/Video/Video";
import {useHistory} from "react-router-dom";

function Historic() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const {setCurrentPage} = useLogged();
    const [views, setViews] = useState(null);

    useEffect(() => {
        setCurrentPage('historic');

        axios.get(`${API_URL}/historic/views`)
            .then(response => setViews(response.data));

    }, []);

    return <div className="Historic">
        <div className='main'>
            <div className={"suggested_videos"}>
                <h1>Videos que visualizaste...</h1>
            </div>
            {!views && <p>A carregar</p>}
            {views && <div className='video-box'>
                {views.length === 0 && <p>Sem resultados</p>}
                {views.map(v => <Video
                    key={v.View_ID}
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

export default Historic;