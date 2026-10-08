import React, { useState } from 'react';
import axios from "axios";
import './TopTags.scss';
import {useEffect} from "react";
import {useHistory} from "react-router-dom";

function TopTags() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    let history = useHistory();
    const [tags, setTags] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/video_tag/top`)
            .then(response => setTags(response.data));
    }, []);

    const redirectTags = (tag) => {
        history.replace(`/relatedTags?tag=${tag}`);
        window.location.reload();
    }

    return (
        <div className="TopTags">
            <h4>TAGS</h4>
            <div className='tags'>
                {!tags && <p>A carregar</p>}
                {tags && <>
                    {tags.length === 0 && <p>Sem resultados</p>}
                    {tags.map(t => {
                        return <span onClick={() => redirectTags(t.Tag_Name)} key={t.Tag_Name} className='tag'>{t.Tag_Name}</span>
                    })}
                </>}
            </div>
        </div>
    )
}

export default TopTags;