import "./UploadVideo.scss";
//import {useForm} from "react-hook-form";
import {faFingerprint} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useCallback, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
//npm install bootstrap --save
import {useForm} from "react-hook-form";
//npm install @hookform/resolvers (Para usar o useForm)
import {Button} from "react-bootstrap";
import {Redirect, useHistory, useParams} from "react-router-dom";
import Tags from "../Tags/Tags";
import {useLogged} from "../../../providers/isLogged";
import axios from "axios";
import React from "react";

function UploadVideo(props) {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    // Tags chosen for the user
    let history = useHistory();
    const {tags, setTags} = useLogged();
    const video_id = props.videoID;
    const {register, handleSubmit, formState, watch, reset} = useForm();
    const [thumbID, setThumbID] = useState(1);
    const [minTags, setMinTags] = useState(false);


    // The register of the hook useForm replaces the input name
    const [videoDescription] = watch(["videoDescription"]);

    const sendVideo = async (values) => {

        // INPUT TO UPDATE INTO THE TABLE VIDEO
        const videoInput = {
            Video_Title: values.videoTitle,
            Video_Description: values.videoDescription,
            Video_Thumbnail: `${API_URL}/thumbnail/${video_id}/tn_${thumbID}.png?`,
        }
        // INPUT TO INSERT INTO THE TABLE VIDEO_TAG
        const videoTag = tags.map(t => {
            return {Tag_Name: t.id.toLowerCase()};
        })
        if(videoTag.length === 0)
            setMinTags(true);

        if(videoTag.length > 0) {
            try {
                let insert = await axios.post("http://localhost:3001/video/update", {video_id, videoInput, videoTag}).then((res) => {
                    setTags([]);
                    history.replace(`/watch?v=${video_id}`);
                });
            } catch (err) {
                console.log(err);
                history.replace(`/home`);
            }
        }
    }

    return <div className="UploadVideo">
        <div className='upload-box'>
            <form className={"container_upload"} onSubmit={handleSubmit(sendVideo)}>
                <div className="content_1">
                    <h4 className={"left"}>Escolher Thumbnail</h4>
                    <div className={"right"}>
                        <FontAwesomeIcon className={"fingerPrint"} icon={faFingerprint}/>
                        <span className={"text_Video"}>Your video ID: </span>
                        <span className={"ID_Video"}>{video_id}</span>
                    </div>
                </div>
                <div className="content_2">
                    <p>Neste passo deverá escolher uma thumbnail</p>
                    <p>para a capa do seu vídeo</p>
                </div>
                <div className="content_4">
                    <div className={"choose_thumbnail showBox " + (thumbID === 1 ? "chosen_thumb" : '')} style={{ backgroundImage: `url(http://localhost:3001/thumbnail/${video_id}/tn_1.png)` }} onClick={()=> {setThumbID(1)}}>
                        <span className="tooltiptext">Escolher como capa</span>
                    </div>
                    <div className={"choose_thumbnail showBox " + (thumbID === 2 ? "chosen_thumb" : '')} style={{ backgroundImage: `url(http://localhost:3001/thumbnail/${video_id}/tn_2.png)` }} onClick={()=> {setThumbID(2)}}>
                        <span className="tooltiptext">Escolher como capa</span>
                    </div>
                    <div className={"choose_thumbnail showBox " + (thumbID === 3 ? "chosen_thumb" : '')} style={{ backgroundImage: `url(http://localhost:3001/thumbnail/${video_id}/tn_3.png)` }} onClick={()=> {setThumbID(3)}}>
                        <span className="tooltiptext">Escolher como capa</span>
                    </div>
                    <div className={"choose_thumbnail showBox " + (thumbID === 4 ? "chosen_thumb" : '')} style={{ backgroundImage: `url(http://localhost:3001/thumbnail/${video_id}/tn_4.png)` }} onClick={()=> {setThumbID(4)}}>
                        <span className="tooltiptext">Escolher como capa</span>
                    </div>
                </div>
                <div className={"Dados_video"}>
                    <h4>Dados do vídeo</h4>
                </div>
                <div className={"primeiro_form"}>
                    <input className={"form-control mb-3 " + (formState.errors["videoTitle"] ? "input-error" : '')}
                           placeholder="Título do vídeo"
                           {...register("videoTitle", {
                               required: "Obrigatório preencher",
                               minLength: {value: 5, message: "Mínimo 5 caracteres"}
                           })}/>
                    {formState.errors["videoTitle"] && <span>{formState.errors["videoTitle"].message}</span>}
                </div>
                <div className={"segundo_form"}>
                <textarea className={"form-control mb-3 " + (formState.errors["videoDescription"] ? "input-error" : '')}
                          placeholder="Descrição do vídeo"
                          {...register("videoDescription", {
                              //required: "Obrigatório preencher",
                              maxLength: {value: 500, message: "Máximo 500 caracteres"}
                          })}/>
                </div>
                <p className={"contagem"}>{videoDescription ? videoDescription.length : 0}/500</p>
                {formState.errors["videoDescription"] && <span>{formState.errors["videoDescription"].message}</span>}
                <div className='tag-send'>
                    <Tags/>
                    {minTags && <p>Escolha pelo menos uma tag!!!</p>}
                    <div className={"button-box"}>
                        <Button className={"button"} type={"submit"} variant={"primary"}>Finalizar Upload</Button>
                    </div>
                </div>
            </form>
        </div>
    </div>
}

export default UploadVideo;