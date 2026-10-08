import "./Results.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import axios from "axios";
import Video from "../../blocks/Video/Video";
import ScrollContainer from "react-indiana-drag-scroll";

function Results() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {setCurrentPage, filter} = useLogged();
    useEffect(() => {
        setCurrentPage('results');
    }, []);

    // GET THE SEARCH VALUE THAT IS IN THE SEARCH PARAM IN THE URL
    let urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search_query');

    const [videos, setVideos] = useState(null);
    const [playlists] = useState(null);

    useEffect(() => {
        const filter = search;

        axios.get(`${API_URL}/video/list`, {params: {search: filter}})
            .then(response => setVideos(response.data));

    }, [search]);

    return <div className="Results">
        <div className='main'>
            <div className={"suggested_videos"}>
                <h1>Videos</h1>
            </div>
            <div className={"videos"}>
                <ScrollContainer className={"videos-scroll-container"}>
                    {!videos && <p>A carregar</p>}
                    {videos && <>
                        {videos.length === 0 && <p>Sem resultados</p>}
                        {videos.map(v => <Video
                            key={v.Video_ID}
                            page={"results"}
                            userId={v.User_ID}
                            userName={v.userName}
                            photo={v.User_Photo}
                            videoId={v.Video_ID}
                            title={v.Video_Title}
                            duration={v.Video_Duration}
                            cover={v.Video_Thumbnail}
                            tags={v.tags}
                            views={v.views}
                            comments={v.comments}
                            likes={v.likes}
                            days={v.Video_Post_Date}
                            open={false}
                        />)}
                    </>}
                </ScrollContainer>
            </div>
            <div className={"suggested_playlists"}>
                <h1>Playlists</h1>
            </div>
            <div className={"playlists"}>
                <ScrollContainer className={"playlists-scroll-container"}>
                    {!playlists && <p>A carregar</p>}
                    {playlists && <>
                        {playlists.length === 0 && <p>Sem resultados</p>}
                        {playlists.map(p => <Video
                            key={p.Playlist_ID}
                            page={"playlist"}
                            cover={p.Playlist_Thumbnail}
                            general={p.User_Name + " " + p.User_Surname}
                            title={p.Playlist_Name}
                            photo={p.User_Photo}
                            days={p.Playlist_Post_Date}
                            duration={p.duration}
                        />)}
                    </>}
                </ScrollContainer>
            </div>
        </div>
    </div>
}

export default Results;