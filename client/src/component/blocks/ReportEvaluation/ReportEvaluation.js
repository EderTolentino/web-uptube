import "./ReportEvaluation.scss"
import React from "react";
import axios from "axios";
import ReactPlayer from "react-player";

function ReportEvaluation(props) {

    const deleteReport = async () => {
        // DELETE REPORT
        try {
            axios.post('http://localhost:3001/interaction/delete_report', {interactionId: props.interactionId}).then((res) => {
                //console.log('Comentário vindo do backend');
                console.log(res.data);
            });

            // FUNCTION SENT FROM WATCH THAT WILL ACCESS THE DATA BASE TO UPDATE THE REPORTS
            await props.refresh();
        } catch (err) {
            console.log(err);
        }
    }

    const deleteVideo = async () => {
        // DELETE REPORT
        try {
            axios.post('http://localhost:3001/video/delete', {videoId: props.videoId}).then((res) => {
                console.log(res.data);
            })

            // FUNCTION TO DELETE THE REPORT
            await deleteReport();
        } catch (err) {
            console.log(err);
        }
    }

    const inactivateChannel = async () => {
        // DELETE CHANNEL
        try {
            axios.post('http://localhost:3001/user/inactivate', {channelId: props.channelId}).then((res) => {
                console.log(res.data);
            });

            // FUNCTION TO DELETE VIDEO AND THAN DELETE THE REPORT
            await deleteVideo();
        } catch (err) {
            console.log(err);
        }
    }

    return <div className={"ReportEvaluation"}>
        <div className='video-player'>
            <ReactPlayer
                className={"react-player"}
                width={'300px'}
                controls
                url={`http://localhost:3001/video/${props.videoId}.mp4`}
            />
        </div>
        <div className='evaluation'>
            <div className='decision'>
                <div className='ignore-button' onClick={() => deleteReport()}>IGNORAR REPORT</div>
                <div className='delete-video-button' onClick={() => deleteVideo()}>DELETAR VÍDEO</div>
                <div className='delete-channel-button' onClick={() => inactivateChannel()}>INATIVAR CANAL</div>
            </div>
        </div>
    </div>;
}

export default ReportEvaluation;