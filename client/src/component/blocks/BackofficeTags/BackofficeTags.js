import "./BackofficeTags.scss"
import React from "react";

function BackofficeTags(props) {

    const deleteTag = async (word) => {
        await props.postWords('delete', word);
    }

    return <div className={"BackofficeTags"}>
        <div className='tag-name'>{props.tagName}</div><div className='delete-tag' onClick={() => deleteTag(props.tagName)}>X</div>
    </div>;
}

export default BackofficeTags;