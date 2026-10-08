import "./ForgetPassword.scss"
import Form from "../../blocks/Form/Form";
import {useLogged} from "../../../providers/isLogged";
import axios from "axios";
import {useEffect} from "react";
import {useHistory} from "react-router-dom";

function ForgetPassword() {
    const {setError, setClear, setCurrentPage} = useLogged();

    useEffect(() => {
        setCurrentPage('forgetPassword');
    }, []);

    // GET THE SEARCH VALUE THAT IS IN THE SEARCH PARAM IN THE URL
    let urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('check');
    const id = urlParams.get('code');

    const redefinePassword = async (values) => {
        if(token === null && id === null){
            const forgetPassword = {
                User_Email: values.email
            }
            try {
                let result = await axios.post("http://localhost:3001/user/forgetPassword", forgetPassword);
                if(result)
                    setClear('reset');
            } catch (err) {
                setError(err.response.data);
            }

        } else {
            const newPassword = {
                User_ID: id,
                User_Token: token,
                User_Password: values.password
            };

            //Check if the passwords in the REGISTER are the same
            if (values.password !== values.confirmPassword) {
                setError("Passwords devem ser iguais!");
                return;
            }

            try {
                let result = await axios.post("http://localhost:3001/user/reset_password", newPassword);
                if(result)
                    setClear('reset');
            } catch (err) {
                setError(err.response.data);
            }
        }
    }

    if(!token && !id) {
        const pageValue = 'ForgetPassword';
        const titleValue = 'Recuperar Password';
        const buttonValue = 'Enviar Email de Recuperação';
        const redirectValue = '';
        const messageValue = 'Você receberá um e-mail com um link de redefinição da palavra-passe.';

        return <div className="ForgetPassword">
            <Form page={pageValue} title={titleValue} button_name={buttonValue} redirect={redirectValue} submit={redefinePassword} message={messageValue}/>
        </div>
    } else {
        const pageValue = 'newPassword';
        const titleValue = 'Redefinir o password';
        const buttonValue = 'Confirmar Passwords';
        const redirectValue = '';
        const messageValue = 'Password redefinido com sucesso.';

        return <div className="ForgetPassword">
            <Form page={pageValue} title={titleValue} button_name={buttonValue} redirect={redirectValue} submit={redefinePassword} message={messageValue}/>
        </div>
    }
}

export default ForgetPassword;