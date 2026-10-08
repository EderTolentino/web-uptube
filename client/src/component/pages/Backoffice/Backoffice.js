import "./Backoffice.scss"
import {useLogged} from "../../../providers/isLogged";
import {useEffect, useState} from "react";
import ReactPlayer from "react-player";
import React from "react";
import {Button} from "react-bootstrap";
import axios from "axios";
import {useForm} from "react-hook-form";
import BackofficeTags from "../../blocks/BackofficeTags/BackofficeTags";
import ReportEvaluation from "../../blocks/ReportEvaluation/ReportEvaluation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import SetUserAdm from "../../blocks/SetUserAdm/SetUserAdm";


function Backoffice() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {setCurrentPage} = useLogged();
    const [settings, setSettings] = useState(null);
    const [reports, setReports] = useState(null);
    const [users, setUsers] = useState(null);

    const {
        register: registerFirstField,
        handleSubmit: handleFirstFormSubmit,
        reset: firstReset,
        formState: firstFormState
    } = useForm()

    const {
        register: registerSecondField,
        handleSubmit: handleSecondFormSubmit,
        reset: secondReset,
        formState: secondFormState
    } = useForm()

    const updateForbiddenWords = async (action, word) => {
        if(action === 'delete') {
            // REMOVE THIS TAG FROM THE ARRAY OF FORBIDDEN WORDS
            const index = forbiddenWords.indexOf(word);
            if (index > -1) { // only splice array when item is found
                forbiddenWords.splice(index, 1); // 2nd parameter means remove one item only
            }
        } else if (action === 'add') {
            // REMOVE THIS TAG FROM THE ARRAY OF FORBIDDEN WORDS
            const index = forbiddenWords.indexOf(word);
            if (index === -1) { // only add the new word if it is not there yet
                forbiddenWords.push(word); // add word in the array of forbidden words
            }
        }

        const forbiddenWordsList = forbiddenWords.join();

        try {
            await axios.post(`${API_URL}/backoffice/update_forbidden_words`, {forbiddenWords: forbiddenWordsList}).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
        firstReset(formValues => ({
            ...formValues,
            tags: '',
        }))
        await refreshPage();
    };

    const addWord = async (values) => {
        console.log(values.tags);
        await updateForbiddenWords('add', values.tags);
    }

    const postMaxDuration = async (values) => {
        // CHECK THE FORMAT HH:MM:SS
        console.log(values)
        try {
            await axios.post(`${API_URL}/backoffice/update_max_duration`, {maxDuration: values.maxDuration}).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }

        secondReset(formValues => ({
            ...formValues,
            maxDuration: '',
        }))
        await refreshPage();
    };

    useEffect(() => {
        setCurrentPage('backoffice');

        axios.get(`${API_URL}/backoffice/settings`)
            .then(response => setSettings(response.data[0]));

        axios.get(`${API_URL}/interaction/reports`)
            .then(response => setReports(response.data));

        axios.get(`${API_URL}/backoffice/all_users`)
            .then(response => setUsers(response.data));

    }, []);

    const refreshPage = async () => {
        axios.get(`${API_URL}/backoffice/settings`)
            .then(response => setSettings(response.data[0]));

        axios.get(`${API_URL}/interaction/reports`)
            .then(response => setReports(response.data));

        axios.get(`${API_URL}/backoffice/all_users`)
            .then(response => setUsers(response.data));
    }

    let forbiddenWords = '';
    let maxDuration = '';
    if(settings) {
        forbiddenWords = settings.Forbidden_Words.replaceAll(' ', '').split(',')
        maxDuration = settings.Video_Max_Duration;
    }

    const setUserAdm = async (userId) => {
        try {
            await axios.post(`${API_URL}/backoffice/set_adm`, {userId: userId}).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
        await refreshPage();
    }

    const removeUserAdm = async (userId) => {
        try {
            await axios.post(`${API_URL}/backoffice/remove_adm`, {userId: userId}).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
        await refreshPage();
    }

    const changePermission = async (id, permission) => {
        console.log('ALTERAR PERMISSÃO DE ' + id )

        if(permission === 0) {
            await setUserAdm(id);
            console.log('TORNAR ADM')
        } else if (permission === 1) {
            await removeUserAdm(id);
            console.log('Retirar permissão')
        }
    }

    return <div className="Backoffice">
        <div className='main'>
            <h1>Backoffice UPTube</h1>
            <hr></hr>
            <div className='forbidden-words'>
                <h2>Definir palavras proibidas:</h2>
                <div className='forbidden-list'>
                    {forbiddenWords && forbiddenWords.map(ft => <BackofficeTags
                        key={ft}
                        tagName={ft}
                        postWords={updateForbiddenWords}
                    />)}
                </div>
                <div className='add-forbidden-word'>
                    <form className={"tags_form"} onSubmit={handleFirstFormSubmit(addWord)}>
                        <input className={"form-control " + (firstFormState.errors["tags"] ? "input-error" : '')}
                               placeholder="Proibir a palavra..."
                               {...registerFirstField("tags", {
                                   //required: "Obrigatório preencher",
                                   maxLength: {value: 20, message: "Máximo 20 caracteres"}
                               })}/>
                        <Button className='send' type={"submit"} >Adicionar</Button>
                    </form>
                </div>
            </div>
            <hr></hr>
            <div className='max-duration'>
                <h2>Definir duração máxima dos vídeos:</h2>
                <div className='current-max-duration'>
                    <h2>Duração máxima atual = {maxDuration}</h2>
                </div>
                <div className='update-max-duration'>
                    <form className={"maxDuration_form"} onSubmit={handleSecondFormSubmit(postMaxDuration)}>
                        <input className={"form-control " + (secondFormState.errors["maxDuration"] ? "input-error" : '')}
                               type='time'
                               step='2'
                               placeholder="Duração máxima - hh:mm:ss"
                               {...registerSecondField("maxDuration", {
                                   //required: "Obrigatório preencher",
                                   //maxLength: {value: 500, message: "Máximo 500 caracteres"}
                               })}/>
                        <Button className='send' type={"submit"} >Atualizar</Button>
                    </form>
                </div>
            </div>
            <hr></hr>
            <div className='reported-videos'>
                <h2>Analisar vídeos reportados:</h2>
                <div className='reports'>
                    {!reports && <p>A carregar</p>}
                    {reports && <>
                        {reports.length === 0 && <p>Sem resultados</p>}
                        {reports && reports.map(r => <ReportEvaluation
                            key={r.Interaction_ID}
                            interactionId={r.Interaction_ID}
                            videoId={r.Video_ID}
                            channelId={r.Channel_ID}
                            userId={r.User_ID}
                            refresh={refreshPage}
                        />)}
                    </>}

                </div>
            </div>
            <hr></hr>
            {<div className='set-admin'>
                <h2>Definir administradores do UPTube</h2>
                <div className='adm'>
                    <div className='title'>
                        <div className='select-adm'>Adiministrador</div>
                        <div className='title-id'>ID utilizador</div>
                        <div className='title-name'>Utilizador</div>
                    </div>
                </div>
                <div className='adm'>
                    {users && users.map(u => <SetUserAdm
                        key={u.User_ID}
                        userId={u.User_ID}
                        userAdm={u.User_Adm}
                        userName={u.User_Name}
                        userSurname={u.User_Surname}
                        changePermission={changePermission}
                    />)}
                </div>
            </div>}
        </div>
    </div>
}

export default Backoffice;