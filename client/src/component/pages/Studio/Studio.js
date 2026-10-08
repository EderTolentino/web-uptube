import "./Studio.scss"
import {} from "@mui/material";
import DragArea from "../../blocks/DragArea/DragArea";
import {useLogged} from "../../../providers/isLogged";
import {useEffect} from "react";

function Studio() {
    const {setCurrentPage} = useLogged();
    useEffect(() => {
        setCurrentPage('studio');
    }, []);

    return <div className="Studio">
        <div className={"window_upload"}>
            <DragArea/>
        </div>
    </div>
}

export default Studio;