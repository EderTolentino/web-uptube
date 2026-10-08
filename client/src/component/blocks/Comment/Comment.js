import "./Comment.scss"
import React, {useState} from "react";
import CommentInput from "../CommentInput/CommentInput";
import axios from "axios";
import {useHistory} from "react-router-dom";

function Comment(props) {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    let history = useHistory();

    const [editPopup, setEditPopup] = useState(false);
    const [commentEdition, setCommentEdition] = useState(null);
    const [forbiddenEditingComment, setForbiddenEditingComment] = useState(false);
    const today = new Date();
    const diffInMs = new Date(today) - new Date(props.days)
    let diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    diffInDays = Math.floor(diffInDays);

    const addViewChannel = async () => {
        await axios.post(`${API_URL}/view/channel`, {channelId: props.userId}).then((res) => {

        });
    }

    const redirectProfile = async () => {
        history.replace(`/profile/${props.userId}`);
        await addViewChannel();
    }

    const handleCancel = () => {
        togglePopup();
    }

    const handleEdit = () => {
        setCommentEdition(props.interactionId);
    }

    const handleDelete = async () => {
        // DELETE COMMENT
        try {
            axios.post(`${API_URL}/interaction/delete_comment`, {interactionId: props.interactionId}).then((res) => {
                console.log('Comentário vindo do backend');
                console.log(res.data);
            });

            // FUNCTION SENT FROM WATCH THAT WILL ACCESS THE DATA BASE TO UPDATE THE COMMENTS
            await props.refreshFunc();
        } catch (err) {
            console.log(err);
        }
    }

    const togglePopup = () => {
        setEditPopup(!editPopup);
    }

    const callRefresh = async () => {
        await props.refreshFunc();
    }

    const editingComment = async (values) => {
        if(values === 'cancel') {
            setCommentEdition(null);
            setEditPopup(false);
        } else {
            const inputEditedComment = {
                interactionId: props.interactionId,
                comment: values.comment
            }
            // COMMENT INSERTION
            try {
                await axios.post(`${API_URL}/interaction/edit_comment`, inputEditedComment).then((res) => {
                    console.log('Comentário vindo do backend');
                    console.log(res.data);
                });
                await props.refreshFunc();
            } catch (err) {
                console.log(err);
            }
            setCommentEdition(null);
            setEditPopup(false);

            // FUNCTION SENT FROM WATCH THAT WILL ACCESS THE DATA BASE TO UPDATE THE COMMENTS
            console.log('ESTÁ TROCADO')
            await props.refreshFunc();
        }
    };

    if(commentEdition === props.interactionId) {
        return <><CommentInput
            interactionId={props.interactionId}
            video_id={null}
            valueInput={props.comment}
            submit={editingComment}
            type={'editing'}
            setForbiddenEditingComment={setForbiddenEditingComment}
            refreshEdition={callRefresh}
        />
            {forbiddenEditingComment && <p>Palavra proibida</p>}
        </>
    } else {
        return <div className='Comment'>
            <div className='photo' onClick={() => redirectProfile()} style={{ backgroundImage: `url(${props.photo})` }}></div>
            <div className='data'>
                <div className='channel'>
                    <div className='name'>
                        <h3>{props.user}</h3>
                        <h3 className='date'>há {diffInDays} dias</h3>
                    </div>
                    <div className='edit_button'>
                        <div onClick={togglePopup} className='menu-btn'>
                            <svg width="25" height="10">
                                <path d="M0,5 5,5"     stroke="#fff" strokeWidth="4"/>
                                <path d="M9,5 14,5"   stroke="#fff" strokeWidth="4"/>
                                <path d="M18,5 23,5"   stroke="#fff" strokeWidth="4"/>
                            </svg>
                        </div>
                        {editPopup && <div className='wrapper-edit-comment' onClick={togglePopup}>
                            <div className='delete_edit'>
                                <div className='cancel' onClick={handleCancel}>CANCELAR</div>
                                <div className='delete' onClick={handleDelete}>APAGAR</div>
                                <div className='edit' onClick={handleEdit}>EDITAR</div>
                            </div>
                        </div>}
                    </div>
                </div>
                <div className='comment'>
                    <p>{props.comment}</p>
                </div>
            </div>
        </div>
    }
}

export default Comment;