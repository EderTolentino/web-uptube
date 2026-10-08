import "./Share.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import {CopyToClipboard} from "react-copy-to-clipboard/src";
import {faCopy} from "@fortawesome/free-regular-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailShareButton,
    FacebookMessengerShareButton } from "react-share";
import {
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    EmailIcon,
    FacebookMessengerIcon} from "react-share";

import React from "react";

function Share(props) {
    const {setCurrentPage} = useLogged();
    useEffect(() => {
        setCurrentPage('share');
    }, []);

    const videoId = props.videoId;
    const videoURL = `http://localhost:3000/watch?v=${videoId}`;
    const [embedPopUp, setEmbedPopUp] = useState(false);
    const [copied, setCopied] = useState(false);
    const [embedCopied, setEmbedCopied] = useState(false);
    let embedOpen = "<";
    let embedBody = `iframe width="560" height="315" src="http://localhost:3000/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe`;
    let embedClose = ">";
    let embedIframe = embedOpen + embedBody + embedClose;

    const toggleSharePopUp = (bol) => {
        setEmbedPopUp(bol);
        setCopied(false);
        setEmbedCopied(false);
    }

    return <div className="Share">
        <div className='share-type'>
            <CopyToClipboard text={videoURL} onCopy={()=>{setCopied(true)}}>
                <div className='box'>
                    <div className='icon'><FontAwesomeIcon className={"copy-icon"} icon={faCopy}/></div>
                    <div className='text'>{copied ? "Copiado!" : "Copiar ligação"}</div>
                </div>
            </CopyToClipboard>
        </div>
        <div className='share-type'>
            <FacebookMessengerShareButton
                url={videoURL}
                quote={"link compartilhado por Messenger"}
                //hashtag={"#hashtag"}
                description={"link compartilhado por Messenger"}
                className="messenger"
            >
                <FacebookMessengerIcon className='share-icon' size={32} round />Messenger
            </FacebookMessengerShareButton>
        </div>
        <div className='share-type'>
            <WhatsappShareButton
                url={videoURL}
                quote={"link compartilhado por whatsapp"}
                description={"link compartilhado por whatsapp"}
                className="whatsapp"
            >
                <WhatsappIcon className='share-icon' size={32} round />WhatsApp
            </WhatsappShareButton>
        </div>
        <div className='share-type'>
            <EmailShareButton
                url={videoURL}
                quote={"link compartilhado por email"}
                description={"link compartilhado por email"}
                className="email"
            >
                <EmailIcon className='share-icon' size={32} round />Email
            </EmailShareButton>
        </div>
        <div className='share-type'>
            <FacebookShareButton
                url={videoURL}
                quote={"link compartilhado por facebook"}
                description={"link compartilhado por facebook"}
                className="facebook"
            >
                <FacebookIcon className='share-icon' size={32} round />Facebook
            </FacebookShareButton>
        </div>
        <div className='share-type'>
            <TwitterShareButton
                title={"test"}
                url={videoURL}
                className="twitter"
            >
                <TwitterIcon className='share-icon' size={32} round />Twitter
            </TwitterShareButton>
        </div>
        <div className='share-type' onClick={() => toggleSharePopUp(true)}>
            <div className='box'>
                <div className='icon'>&lt; &frasl; &gt;</div>
                <div className='text' onClick={() => setCopied(false)}>Embed</div>
            </div>
        </div>
        {embedPopUp && <div className='embed-popup'>
            <div className='copy-iframe'>
                {embedIframe}
            </div>
            <hr></hr>
            <div className='buttons'>
                <div className='close' onClick={() => toggleSharePopUp(false)}>Fechar</div>
                <CopyToClipboard text={embedIframe} className='copy' onCopy={()=>{setEmbedCopied(true)}}>
                    <div className='text'>{embedCopied ? "Copiado!" : "Copiar ligação"}</div>
                </CopyToClipboard>
            </div>
        </div>}
    </div>
}

export default Share;