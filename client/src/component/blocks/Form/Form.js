import "./Form.scss"
import logo from "../../../../src/assets/logo.png";
import {useState } from "react";
import {faUser, faKey} from "@fortawesome/free-solid-svg-icons";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link, NavLink, Redirect, useHistory} from "react-router-dom";
import {useLogged} from "../../../providers/isLogged";
import React from "react";
import Google from "../../../img/google.png";
import Github from "../../../img/github.png";

function Form(props) {
    const {error, setError, clear} = useLogged();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [policy] = useState("");

    const google = () => {
        window.open("http://localhost:3001/auth/google", "_self");
    };

    const github = () => {
        window.open("http://localhost:3001/auth/github", "_self");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await props.submit({displayName, email, password, confirmPassword});
        } catch (err) {
            setError(err);
        }
    };

    const handleKeyPress = (event) => {
        if(event.key === 'Enter'){
            handleSubmit();
        }
    }

    if(clear !== 'reset') {
        return (<div className="Form">
                <div className="form_container">
                    <img src={logo} alt={"logo"}/>
                    <h1>{props.title}</h1>
                    <form onSubmit={handleSubmit}>
                        {props.page === "Register" && <div className={"container_input"}>
                            <FontAwesomeIcon className={"icone"} icon={faUser}/>
                            <input
                                className="input_item"
                                type="text"
                                name="displayName"
                                required
                                placeholder="Nome Completo"
                                onChange={(e) => setDisplayName(e.target.value)}
                                value={displayName}
                            />
                            {error.split(' ')[0] === 'Nome' && <p className='error'>{error}</p>}
                        </div>}

                        {props.page !== 'newPassword' && <div className={"container_input"}>
                            <FontAwesomeIcon className={"icone"} icon={faEnvelope}/>
                            <input
                                className="input_item"
                                type="email"
                                name="email"
                                required
                                placeholder="E-mail"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                            {/*error.split(' ')[0] === 'E-mail' && <p className='error'>{error}</p>*/}
                        </div>}

                        {props.page !== "ForgetPassword" && <div className={"container_input"}>
                            <FontAwesomeIcon className={"icone"} icon={faKey}/>
                            <input
                                className="input_item"
                                type="password"
                                name="password"
                                required
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                            />
                            {/*error.split(' ')[0] === 'Password' && <p className='error'>{error}</p>*/}
                            {props.page === "Login" && <NavLink to={"/forgetPassword"}>Esqueceu-se da password?</NavLink>}
                        </div>}
                        {(props.page === "Register" || props.page === 'newPassword') && <div className={"container_input"}>
                            <FontAwesomeIcon className={"icone"} icon={faKey}/>
                            <input
                                className="input_item"
                                type="password"
                                name="confirmPassword"
                                required
                                placeholder="Repetir password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                            />
                            {error.split(' ')[0] === 'Passwords' && <p className='error'>{error}</p>}
                        </div>}

                        {props.page === "Register" && <div className="policy">
                            <label className="policy2">
                                <input className="square"
                                       type="checkbox"
                                       name="policy"
                                       required
                                       value={policy}
                                />
                                <p>Aceito os</p>
                                <NavLink className="terms" to={"/"}>Termos e Condições</NavLink>
                            </label>
                        </div>}
                        <div className="button">
                            <button className="btn" onKeyPress={handleKeyPress}>{props.button_name}</button>
                        </div>
                    </form>

                    {(props.page === "Login") && <>
                        <div className="login">
                            <NavLink to={"/register"}>{props.redirect}</NavLink>
                        </div>
                    </>}
                    {(props.page === "Register") && <>
                        <div className="login">
                            <NavLink to={"/login"}>{props.redirect}</NavLink>
                        </div>
                    </>}

                    {(props.page === "Register" || props.page === 'Login') && <>
                        <div className="google" onClick={google}>
                            <img className="icon_google" src={Google} alt=""/>
                            <h6 className={"texto_google"}>Continuar com o Google</h6>
                        </div>
                        <div className="google" onClick={github}>
                            <img className={"icon_google"} src={Github} alt="" />
                            <h6 className={"texto_google"}>Continuar com o Github</h6>
                        </div>
                    </>}
                </div>
            </div>
        )
    } else {
        return (
            <div className='message'>{props.message}</div>
        )
    }
}
export default Form;