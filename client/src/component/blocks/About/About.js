import "./About.scss"

function About(props) {
    let date = new Date(props.date)
    console.log(date)
    let day = date.getDay();
    let month = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()];
    let year = date.getFullYear()
    date = `${day} de ${month} de ${year}`;

    return <div className={"About"}>
        <p className='creation-date'>Canal criado a {date}</p>
        <p>{props.videos} videos carregados</p>
        <p>{props.playlists} playlists criadas</p>
        <p>{props.views} visualizações no total</p>
        <p>{props.subscriptors} subscritores</p>
    </div>
}

export default About;