import React from "react";
import {useState} from "react";
import {useEffect} from "react";
import axios from "axios";

// Cria um contexto abstrato para fazer a passagem dos dados
const LoggedContext = React.createContext();

// Cria uma caixa em volta do contexto para se comportar como um provedor
function ProviderLogged(props) {
    const API_URL = 'http://localhost:3001';
    //axios.defaults.withCredentials = true;

    // usado para o login
    const [logged, setLogged] = useState( false);
    const [loading, setLoading] = useState( true);
    const [userLogged, setUserLogged] = useState(null);

    /*
    const checkAchievements = async (channelId) => {
        await axios.post(`${API_URL}/interaction/achievementsChecker`, {channelId: IDTESTE}).then((res) => {
            console.log(res.data);
        });
    }

     */


    useEffect(() => {
        axios.get(`${API_URL}/user/session`, {
            withCredentials: true
        })
            .then(response => {
                setUserLogged(response.data.user);
                setLoading(false);
            }).catch((error) => {
                console.log(error, "erro sessao");
                setLoading(false);
        });
    }, []);


    // usado nos formulários
    const [error, setError] = useState("");
    // Usado para limpar os formulários
    const [clear, setClear] = useState("");

    // usado para saber a página atual e mostrar ou não o navigation e o header
    const [currentPage, setCurrentPage] = useState('home');

    // usado para fazer o controle das tags escolhidas pelo user
    const [tags, setTags] = React.useState([]);

    // usado na barra de pesquisas para fazer a filtragem e TALVEZ a paginação
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);


    // Criação de um componente que vai estar a volta do resto
    // Toda a app vai estar dentro do provider
    return <LoggedContext.Provider value={{logged, setLogged, userLogged, setUserLogged, loading, error, setError, clear, setClear, tags, setTags, currentPage, setCurrentPage, filter, setFilter, page, setPage}}>
        {props.children}
    </LoggedContext.Provider>
}

function useLogged() {
    return React.useContext(LoggedContext);
}

export {useLogged, ProviderLogged};