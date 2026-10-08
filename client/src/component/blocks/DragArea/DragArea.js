import React, {useState} from 'react';
import axios from 'axios';
import "./DragArea.scss";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { ProgressBar, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import UploadVideo from "../UploadVideo/UploadVideo";
import {useLogged} from "../../../providers/isLogged";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpload} from "@fortawesome/free-solid-svg-icons";

function DragArea() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    // drag state
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = React.useRef(null);
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [stage, setStage] = useState(1);
    const [videoID, setVideoID] = useState(null);
    const [fileName, setFileName] = useState(null);

    // handle drag events
    const handleDrag = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // TRIGGERS WHEN THE FILE IS DROPPED
    const handleDrop = async function(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        // ONLY ACCEPTABLE DROPPING ONE VIDEO AT A TIME
        const video = e.dataTransfer.files;
        if (video && video.length === 1) {
            setFileName(video[0].name)
            const formData = new FormData();
            formData.append('file', video[0], video[0].name);
            await handleFile(formData);
        }
    };

    // FUNCTION TO HANDLE THE SUBMITTED FILE
    const handleFile = async function(formData) {
        setStage(2);
        try {
            const response = await axios({
                method: "post",
                url: `${API_URL}/video/upload`,
                withCredentials: true,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: progressEvent => {
                    const { loaded, total } = progressEvent;
                    const progress = Math.floor((loaded * 100) / total);
                    setUploadPercentage(progress);
                }
            }).then((res) => {
                if(res.statusText === 'OK'){
                    setStage(3);
                    setVideoID(res.data.video_id);
                }
            });
        } catch(error) {
            console.log(error)
        }
    }

    // TRIGGERS WHEN THE VIDEO IS UPLOADED WITH CLICK
    const handleChange = async function(e) {
        e.preventDefault();
        e.stopPropagation();


        // ONLY ACCEPTABLE DROPPING ONE VIDEO AT A TIME
        const video = e.target.files;
        if (video && video.length === 1) {
            const formData = new FormData();
            formData.append('file', video[0], video[0].name);
            await handleFile(formData);
        }
    };

    // TRIGGERS THE INPUT WHEN THE BUTTON IS CLICKED
    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div className='DragArea'>
            {(stage === 1 || stage === 2) && <h2>Upload de um novo vídeo</h2>}
            <div className='drag-content'>
                {stage === 1 && <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                    <input ref={inputRef} type="file" id="input-file-upload" multiple={false} onChange={handleChange}/>
                    <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                        <div id='drag-box'>
                            <div className='drag-area'>
                                <div><FontAwesomeIcon className={"drag-icon"} icon={faUpload}/></div>
                                <p>Arraste para aqui o vídeo ou clique</p>
                                <p>para escolher o ficheiro</p>
                                <button className="upload-button" onClick={onButtonClick}></button>
                            </div>
                        </div>
                    </label>
                    {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag}
                                        onDragOver={handleDrag} onDrop={handleDrop}></div>}
                </form>}

                {stage === 2 && <div className='progress-bar-box'>
                    <div className='progress-bar'>
                        <CircularProgressbar
                            value={uploadPercentage}
                            styles={buildStyles({
                                // Rotation of path and trail, in number of turns (0-1)
                                rotation: 0.25,

                                // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                strokeLinecap: 'butt',

                                // Text size
                                textSize: '16px',

                                // How long animation takes to go from one percentage to another, in seconds
                                pathTransitionDuration: 0.5,

                                // Can specify path transition in more detail, or remove it entirely
                                // pathTransition: 'none',

                                // Colors
                                pathColor: `rgba(62, 152, 199, ${uploadPercentage / 100})`,
                                textColor: '#f88',
                                trailColor: '#d6d6d6',
                                backgroundColor: '#3e98c7',
                            })}
                        />
                    </div>
                    {stage === 2 && uploadPercentage === 100 && <p className='file-name'><span>{fileName}</span></p>}
                    {stage === 2 && <ProgressBar now={uploadPercentage}/>}
                    {stage === 2 && uploadPercentage === 100 && <p><span>A carregar o seu vídeo,</span></p>}
                    {stage === 2 && uploadPercentage === 100 && <p><span>por favor aguarde...</span></p>}
                </div> }
                {stage === 3 && <UploadVideo videoID={videoID}/>}
            </div>
        </div>
    )
}

export default DragArea;
