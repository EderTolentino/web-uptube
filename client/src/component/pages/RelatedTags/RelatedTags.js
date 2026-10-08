import "./RelatedTags.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import Video from "../../blocks/Video/Video";
import axios from "axios";

function RelatedTags() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {setCurrentPage} = useLogged();

    // GET THE TAG NAME IN THE SEARCH PARAM IN THE URL
    let urlParams = new URLSearchParams(window.location.search);
    let tagName = urlParams.get('tag');

    const [tagVideos, setTagVideos] = useState(null);

    useEffect(() => {
        setCurrentPage('relatedTags');

        axios.post(`${API_URL}/tag/related`, {tagName: tagName})
            .then(response => setTagVideos(response.data));

    }, []);

    return <div className="RelatedTags">
        <div className='main'>
            <div className={"suggested_videos"}>
                <h1>Vídeos com a tag: #{tagName}</h1>
            </div>
            {!tagVideos && <p>A carregar</p>}
            {tagVideos && <div className='video-box'>
                {tagVideos.length === 0 && <p>Sem resultados</p>}
                {tagVideos.map(v => <Video
                    key={v.Video_ID}
                    page={"home"}
                    userId={v.User_ID}
                    userName={v.userName}
                    photo={v.User_Photo}
                    videoId={v.Video_ID}
                    title={v.Video_Title}
                    duration={v.Video_Duration}
                    cover={v.Video_Thumbnail}
                    views={v.views}
                    comments={v.comments}
                    likes={v.likes}
                    days={v.Video_Post_Date}
                    open={false}
                />)}
            </div>}
        </div>
    </div>
}

export default RelatedTags;