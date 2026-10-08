import "./Register.scss"
import Form from "../../blocks/Form/Form";
import axios from "axios";
import {useLogged} from "../../../providers/isLogged";
import {useEffect} from "react";
import {useHistory} from "react-router-dom";

function Register() {
    const {setError, setCurrentPage, setClear} = useLogged();
    useEffect(() => {
        setCurrentPage('register');
    }, []);

    const registerUser = async (values) => {
        const userInput = {
            User_Full_Name: values.displayName,
            User_Email: values.email,
            User_Password: values.password
        };

        //Check if the passwords in the REGISTER are the same
        if (values.password !== values.confirmPassword) {
            setError("Passwords devem ser iguais!");
            return;
        }

        try {
            let result = await axios.post("http://localhost:3001/user/register", userInput);
            if(result)
                setClear('reset');
        } catch (err) {
            setError(err.response.data);
        }
    }

    const success = 'Registo efetuado com sucesso. Acesse o seu e-mail e click no link para fazer a verificação da conta!';

    return <div className="Register">
        <Form page={"Register"} title={"Criar conta"} button_name={"Registar"} redirect={"Fazer login"} submit={registerUser} message={success}/>
     </div>
}

export default Register;