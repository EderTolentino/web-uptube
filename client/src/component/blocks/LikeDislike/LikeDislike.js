import "./LikeDislike.scss"
import likeFull from "../../../assets/likeFull.png";
import likeOpen from "../../../assets/likeOpen.png";
import dislikeFull from "../../../assets/dislikeFull.png";
import dislikeOpen from "../../../assets/dislikeOpen.png";
import React from "react";
import {useEffect, useState} from "react";
import {useLogged} from "../../../providers/isLogged";

function LikeDislike(props) {
    const {userLogged} = useLogged();
    const [like, setLike] = useState(null);
    const [dislike, setDislike] = useState(null);

    useEffect(() => {
        if(props.likeDislike && props.likeDislike.Type === 'iLike') {
            setLike(1);
            setDislike(null);
        } else if(props.likeDislike && props.likeDislike.Type === 'Dislike') {
            setLike(null);
            setDislike(1);
        } else {
            setLike(null);
            setDislike(null);
        }
    }, [props.likeDislike]);

    return <div className='LikeDislike'>
        <div className={"image"} onClick={async () => {
            if(userLogged)
                await props.submit('iLike');
        }}>
            <img src={like !== null ? likeFull : likeOpen} alt={'Botão para dar like'}/>
        </div>
        <span>{props.numLikes}</span>
        <span className='separator'>|</span>
        <div className={"image"} onClick={async () => {
            if(userLogged)
                await props.submit('Dislike');
        }}>
            <img src={dislike !== null ? dislikeFull : dislikeOpen} alt={'Botão para dar dislike'}/>
        </div>
        <span>{props.numDislikes}</span>
    </div>
}

export default LikeDislike;