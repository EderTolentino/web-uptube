import "./Settings.scss"
import {useLogged} from "../../../providers/isLogged";
import {useState} from "react";
import React from 'react'
import axios from "axios";
import {useHistory} from "react-router-dom";

function Settings() {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;

    let history = useHistory();
    const {userLogged} = useLogged();
    const [updateUserCover, setUpdateUserCover] = useState(null);
    const [updateUserPhoto, setUpdateUserPhoto] = useState(null);
    const [updateUserName, setUpdateUserName] = useState(null);
    const [updateUserSurname, setUpdateUserSurname] = useState(null);
    const [deletePopUp, setDeletePopUp] = useState(false);
    const [infoUpdated, setInfoUpdated] = useState(false);

    let handleSubmit = async (e) => {
        e.preventDefault();

        if(updateUserCover) {
            const formDataCover = new FormData();
            formDataCover.append("photo", updateUserCover);

            axios.post(`${API_URL}/user_settings/cover`,formDataCover, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((res) => {
                    //console.log('OKKK');
                }).catch((error) => {
                console.log(error)
            });
        }

        if(updateUserPhoto) {
            const formDataPhoto = new FormData();
            formDataPhoto.append("photo", updateUserPhoto);

            axios.post(`${API_URL}/user_settings/photo`,formDataPhoto, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((res) => {
                    //console.log('OKKK');
                }).catch((error) => {
                console.log(error)
            });
        }

        if(updateUserName || updateUserSurname) {
            const updateInput = {
                userName: updateUserName,
                userSurname: updateUserSurname
            }
            axios.post(`${API_URL}/user_settings/name_surname`, updateInput, {
                withCredentials: true
            })
                .then((res) => {
                    console.log('OK');
                }).catch((error) => {
                console.log(error)
            })
        }
    }

    const toggleDeletePopUp = () => {
        setDeletePopUp(!deletePopUp);
    }

    const successUpdated = () => {
        setInfoUpdated(true);
    }

    const deleteChannel = async () => {

        axios.post(`${API_URL}/user_settings/delete_account`, {
            withCredentials: true
        })
            .then((res) => {
                //console.log('OKKK');
            }).catch((error) => {
            console.log(error)
        });

        history.replace(`/home`);
        window.location.reload();
    }

    if(!userLogged) {
        return <p>A carregar...</p>
    } else {
        return <div className="Settings">
            <div className='main'>
                <h2>SETTINGS CANAL</h2>
                <hr></hr>
                <form className='form' onSubmit={handleSubmit}>
                    <div className="inputContainer">
                        <h4>Alterar a foto de capa:</h4>
                        <label>Escolha uma foto</label>
                        <input className='fotoCapa' type="file" name="cover" accept="image/png, image/jpeg" onChange={e =>  setUpdateUserCover(e.target.files[0])}/>
                    </div>
                    <hr></hr>
                    <div className="inputContainer">
                        <h4>Alterar a foto de perfil:</h4>
                        <label>Escolha uma foto</label>
                        <input className='fotoPerfil' type="file" name="photo" accept="image/png, image/jpeg" onChange={e =>  setUpdateUserPhoto(e.target.files[0])}/>
                    </div>
                    <hr></hr>
                    <div className="inputContainer">
                        <h4>Alterar nome e sobrenome:</h4>
                        <div>
                        <label className='editar'>Editar nome:</label>
                        <input className='textoNome' type="text" defaultValue={userLogged.User_Name} name="userName" onChange={e =>  setUpdateUserName(e.target.value)}/>
                        </div>
                        <div>
                        <label>Editar sobrenome:</label>
                        <input className='textosobre' type="text" defaultValue={userLogged.User_Surname} name="userSurname" onChange={e =>  setUpdateUserSurname(e.target.value)}/>
                        </div>
                    </div>
                    <button className= 'gravar' type="submit" onClick={() => successUpdated()}>{infoUpdated ? 'Gravadas' : 'Gravar Alterações'}</button>
                </form>
                <hr></hr>
                <div className='delete-profile'>
                    <h4>Apagar o canal:</h4>
                    <div className='delete' onClick={() => toggleDeletePopUp()}>APAGAR CANAL</div>
                </div>
                {deletePopUp && <div className='send_area' onClick={() => setDeletePopUp(false)}>
                    <div className='buttons'>
                        <h4>Deseja excluir o canal?</h4>
                        <div className='buttons-box'>
                            <div className='cancel' onClick={() => toggleDeletePopUp()}>CANCELAR</div>
                            <div className='send' onClick={() => deleteChannel()}>EXCLUIR CANAL</div>
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    }
}

export default Settings;
