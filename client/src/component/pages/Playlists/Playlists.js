import "./Playlists.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect} from "react";
import Video from "../../blocks/Video/Video";
import {useState} from "react";
import axios from "axios";
import ScrollContainer from 'react-indiana-drag-scroll';

function Playlists() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {setCurrentPage} = useLogged();
    const [playlists, setPlaylists] = useState(null);
    let userPlaylists = [];

    useEffect(() => {
        setCurrentPage('playlists');
        axios.get(`${API_URL}/video_playlist/list`)
            .then(response => setPlaylists(response.data));
    }, []);

    if(playlists) {
        playlists.map(p => {
            if(!userPlaylists.includes(p.Playlist_Name)) {
                userPlaylists.push(p.Playlist_Name);
            }
        })
    }

    const formatDuration = (duration) => {
        if (duration) {
            return (duration[0] === '0' && duration[1] === '0') ? duration.slice(3) : duration
        } else {
            return ('00:00');
        }
    }

    return <div className="Playlists">
        <div className='main'>
            <h1>MINHAS PLAYLISTS</h1>
            {!playlists && <p>A carregar</p>}
            {playlists && <>
                {playlists.length === 0 && <p>Sem resultados</p>}
                {userPlaylists.map(pn => <div key={pn}>
                    <h1>{pn}</h1>
                    <ScrollContainer className={"playlists-scroll-container"}>
                        {playlists.map(p => {
                            if(pn === p.Playlist_Name){
                                return <Video
                                    key={p.Video_Playlist_ID}
                                    page={"playlistPage"}
                                    cover={p.Video_Thumbnail}
                                    videoId={p.Video_ID}
                                    title={p.Video_Title}
                                    duration={formatDuration(p.Video_Duration)}
                                    open={p.Playlist_ID}
                                />
                            }
                        })}
                    </ScrollContainer>
                </div>)}
            </>}
        </div>
    </div>
}

export default Playlists;