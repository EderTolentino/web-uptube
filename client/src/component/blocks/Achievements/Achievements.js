import "./Achievements.scss";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

function Achievement(props) {
    const setAchievements = async () => {
        await props.refreshPage();
    }

    return <div className={"Achievement " + props.type}>
        <div className={"box"}>
            <img className={"image"} src={props.Achievement_Item} alt={"Imagem_cup"}/>
            <p className={"name"}> {props.Achievement_Name}</p>
            {props.edition && <div className='hide' onClick={() => setAchievements()}><FontAwesomeIcon className='hidden-icon' icon={faXmark}/></div>}
        </div>
    </div>
}

export default Achievement;