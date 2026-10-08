import "./CommentInput.scss"
import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import axios from "axios";
import {useForm} from "react-hook-form";
import {useLogged} from "../../../providers/isLogged";
import {useHistory} from "react-router-dom";

function Comment(props) {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    const {userLogged, forbiddenComment} = useLogged();
    let history = useHistory();
    const {register, handleSubmit, formState, watch, reset} = useForm();
    const [settings, setSettings] = useState(null);
    // The register of the hook useForm replaces the input name
    const [watchComment] = watch(["comment"]);

    useEffect(() => {
        if(forbiddenWords) {
            if (props.type === 'new') {
                props.setForbiddenNewComment(false)
                forbiddenWords.map(w => {
                    if(watchComment.toLowerCase().includes(w)) {
                        props.setForbiddenNewComment(true);
                    }
                })
            }
            if (props.type === 'editing') {
                props.setForbiddenEditingComment(false);
                forbiddenWords.map(w => {
                    if(watchComment.toLowerCase().includes(w)) {
                        props.setForbiddenEditingComment(true);
                    }
                })
            }
        }

    }, [watchComment]);

    const[textLength, setTextLength] = useState(0);
    useEffect(() => {
        if(props.valueInput && props.valueInput.length > 0)
            setTextLength(props.valueInput.length);

        axios.get(`${API_URL}/backoffice/settings`)
            .then(response => setSettings(response.data[0]));
    }, []);

    let forbiddenWords = '';
    if(settings) {
        forbiddenWords = settings.Forbidden_Words.replaceAll(' ', '').split(',');
    }

    useEffect(() => {
        if(watchComment?.length >= 0)
            setTextLength(watchComment?.length);
    }, [watchComment]);

    const addViewChannel = async () => {
        await axios.post(`${API_URL}/view/channel`, {channelId: userLogged.User_ID}).then((res) => {
            console.log(res.data);
        });
    }

    const redirectProfile = async () => {
        history.replace(`/profile/${userLogged.User_ID}`);
    }

    const postComment = async (values) => {

        const inputComment = {
            video_id: props.video_id,
            comment: values.comment
        }

        if(!props.interactionId) {
            // NEW COMMENT
            await props.submitNewComment(inputComment);

        } else {
            // EDITED COMMENT
            props.submit(values);
        }
        reset(formValues => ({
            ...formValues,
            comment: '',
        }))
    }

    return <div className='container_add_comment'>
        <div className='photo' onClick={() => redirectProfile()} style={{ backgroundImage: `url(${userLogged.User_Photo})` }}></div>
        <form className={"comment_form"} onSubmit={handleSubmit(postComment)}>
            <div className={"comment_area"}>
                <textarea className={"form-control " + (formState.errors["comment"] ? "input-error" : '')}
                          placeholder="Escreva um comentário..."
                          defaultValue={props.valueInput}
                          {...register("comment", {
                              //required: "Obrigatório preencher",
                              maxLength: {value: 500, message: "Máximo 500 caracteres"}
                          })}
                />
                {(forbiddenComment && props.type === 'new') && <p>AQUI FUNCIONA</p>}
                {(forbiddenComment && props.type === 'editing') && <p>AQUI FUNCIONA</p>}
            </div>
            <div className='send_area' style={textLength > 0 ? {display: `flex`} : {display: `none`}}>
                <p className='count'>{textLength}/500</p>
                {formState.errors["comment"] && <span>{formState.errors["comment"].message}</span>}
                <div className='buttons'>
                    <div className='cancel' onClick={() => {
                        props.submit('cancel');
                        reset(formValues => ({
                            ...formValues,
                            comment: '',
                        }))
                    }}>Cancelar</div>
                    <Button className='send' type={"submit"}>Comentar</Button>
                </div>
            </div>
        </form>
    </div>
}

export default Comment;