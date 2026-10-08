import React, { useState } from 'react';
import axios from "axios";
import './Tags.scss';

import { WithContext as ReactTags } from 'react-tag-input';
import {useLogged} from "../../../providers/isLogged";
import {useEffect} from "react";

const KeyCodes = {
    comma: 188,
    enter: 13
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

function Tags() {
    const {tags, setTags} = useLogged();
    const [addedTags, setAddedTags] = useState([]);
    const [tagList, setTagList] = useState([]);
    const [settings, setSettings] = useState(null);
    const [forbiddenTag, setForbiddenTag] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:3001/tag/list")
            .then(response => setTagList(response.data));

        axios.get(`http://localhost:3001/backoffice/settings`)
            .then(response => setSettings(response.data[0]));

    }, []);

    let forbiddenWords = '';
    if(settings) {
        forbiddenWords = settings.Forbidden_Words.replaceAll(' ', '').split(',')
    }

    const suggestions = tagList.map(t => {
        return {
            "id": t.Tag_Name,
            "text": t.Tag_Name
        };
    })

    const handleDelete = i => {
        setAddedTags(addedTags.filter((tag, index) => index !== i));
        setForbiddenTag(null)
    };

    const handleAddition = tag => {
        console.log(tag.text);
        if(forbiddenWords.includes(tag.text)) {
            setForbiddenTag(`A palavra ${tag.text} não é permitida no Uptube`);
        } else {
            setTags([...tags, tag]);
        }
        setAddedTags([...addedTags, tag]);
    };

    // Function to change the position of the tags using drag and drop
    const handleDrag = (tag, currPos, newPos) => {
        const newTags = addedTags.slice();

        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);
        // re-render
        setAddedTags(newTags);
    };

    return (
        <div className="Tags">
            <h4>Tags</h4>
            <div className='container'>
                <ReactTags
                    tags={addedTags}
                    suggestions={suggestions}
                    delimiters={delimiters}
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}
                    handleDrag={handleDrag}
                    inputFieldPosition="bottom"
                    autocomplete
                />
                {forbiddenTag && <p>{forbiddenTag}</p>}
            </div>
        </div>
    );
}

export default Tags;