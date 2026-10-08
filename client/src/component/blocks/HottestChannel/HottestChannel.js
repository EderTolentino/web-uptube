import "./HottestChannel.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-regular-svg-icons"
import axios from "axios";
import {useLogged} from "../../../providers/isLogged";
import {useHistory} from "react-router-dom";

function HottestChannel(props) {
    let history = useHistory();
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {userLogged} = useLogged();

    const addViewChannel = async () => {
        await axios.post(`${API_URL}/view/channel`, {channelId: props.channelId}).then((res) => {

        });
    }

    const redirectProfile = async () => {
        history.replace(`/profile/${props.channelId}`);
        if(props.channelId !== userLogged.User_ID) {
            await addViewChannel();
        }
    }

    return <div className={"HottestChannel " + props.page} onClick={() => redirectProfile()}>
        {["tendencies"].includes(props.page) &&
            <>
                <div className={"channel_data"}>
                    <img className={"user_pic"} src={props.userPhoto} alt={"user_pic"}/>
                    <h3 className={"description_name"}>{props.userName}</h3>
                </div>
            </>
        }
        {["tendencie"].includes(props.page) &&
            <>
                <div className={"channel_data"}>
                    <img className={"user_pic"} src={props.userPhoto} alt={"user_pic"}/>
                    <div className={"data"}>
                        <h3 className={"description_name"}>{props.userName}</h3>
                        <h5 className={"description"}>{props.userDescription}</h5>
                    </div>
                </div>
                <div className={"channel_box"}>
                    <img className={"thumb_pic"} src={props.userCover} alt={"thumb_pic"}/>
                    <div className={"channel_bottom"}>
                        <FontAwesomeIcon className={"icones"} icon={faUser}/>
                        <h5 className={"follow_channel"}>Seguir Canal</h5>
                    </div>
                </div>
            </>
        }
    </div>;
}
export default HottestChannel;