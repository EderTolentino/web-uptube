import "./CoverProfile.scss"
import React, {useState} from "react"; // REPLACE FOR {props.photo}
import {faPenToSquare} from "@fortawesome/free-regular-svg-icons"
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useHistory} from "react-router-dom";

function CoverProfile(props) {
    let history = useHistory();
    const [editChannel, setEditChannel] = useState(false);

    const startEdition = () => {
        setEditChannel(!editChannel)
        props.editProfileFunc();
    }

    const openSettings = () => {
        history.replace(`/settings`);
    }

    return <div className={"CoverProfile"}>
        <div className='cover-box'>
            <div className={"cover"} style={{ backgroundImage: `url(${props.Channel_Cover})` }}>
                {editChannel && <div className='edit-profile' onClick={() => openSettings()}><FontAwesomeIcon className={"pencil"} icon={faPenToSquare}/></div>}
            </div>
            {(props.Channel_ID.toString() === props.User_Logged.toString()) && <div className='pencil-edit' onClick={() => startEdition()}>
                Editar canal <FontAwesomeIcon className={"pencil"} icon={faPenToSquare}/>
            </div>}
        </div>
        <div className={"description"}>
            <div className='name'>
                <div className='name-box'>
                    <div className='title'>{props.Channel_Name}</div>
                    {editChannel && <div className='edit-profile' onClick={() => openSettings()}><FontAwesomeIcon className={"pencil"} icon={faPencil}/></div>}
                </div>
                <div className='value'>{props.Channel_Description}</div>
            </div>
            <div className='subscribers'>
                <div className='title'>Subscritores</div>
                <div className='value'>{props.Channel_Subscribers}</div>
            </div>
            <div className='views'>
                <div className='title'>Visualizações</div>
                <div className='value'>{props.Channel_Views}</div>
            </div>
            <div className='videos'>
                <div className='title'>Vídeos</div>
                <div className='value'>{props.Channel_Videos}</div>
            </div>
            <div className='photoContainer'>
                <div className='photo-box'><div className={"photo"} style={{ backgroundImage: `url(${props.Channel_Photo})`}}>
                    {editChannel && <div className='edit-profile' onClick={() => openSettings()}><FontAwesomeIcon className={"pencil"} icon={faPenToSquare}/></div>}
                </div></div>
            </div>
        </div>
    </div>;
}

export default CoverProfile;