import "./Login.scss"
import Form from "../../blocks/Form/Form";
import React from "react";
import {useLogged} from "../../../providers/isLogged";
import axios from "axios";
import {useEffect} from "react";
import {useHistory} from "react-router-dom";

function Login() {
    let history = useHistory();
    const {setUserLogged, setCurrentPage} = useLogged();
    useEffect(() => {
        setCurrentPage('login');
    }, []);

    const loginUser = async (e) => {
        const userInput = {
            User_Email: e.email,
            User_Password: e.password
        };

        axios.post('http://localhost:3001/user/Login', userInput, {
            withCredentials: true
        })
            .then((res) => {
                setUserLogged(res.data.user[0]);
                history.replace("/Home");
            }).catch((error) => {
            console.log(error);
            history.replace("/register");
        });
    }

    return <div className="Login">
        <Form page={"Login"} title={"Fazer Login"} button_name={"Login"} redirect={"Criar conta"} submit={loginUser}/>
    </div>
}

export default Login;