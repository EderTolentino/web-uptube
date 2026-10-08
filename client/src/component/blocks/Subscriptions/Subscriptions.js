import "./Subscriptions.scss"
import React from "react";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from "axios";
import {useHistory} from "react-router-dom";

function Subscriptions(props) {
    let history = useHistory();

    const removeSubscription = async () => {
        const inputSubscription = {
            Interaction_ID: props.interactionId
        }
        try {
            await axios.post('http://localhost:3001/interaction/remove_subscription', inputSubscription).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
        props.refresh();
    }

    const redirectProfile = () => {
        history.replace(`/profile/${props.userId}`);
        props.refresh();
    }

    return <div className='Subscriptions'>
        <div className='channels'>
            <div className='channel'>
                <div className={"photo"} onClick={() => redirectProfile()} style={{ backgroundImage: `url(${props.photo})` }}></div>
                <div className='channel_name'>{props.channel}</div>
                {props.edition && <FontAwesomeIcon onClick={() => removeSubscription()} className='trash' icon={faTrash}/>}
            </div>
        </div>
    </div>;
}

export default Subscriptions;