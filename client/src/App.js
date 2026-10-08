import './App.scss';
import './Geral.scss';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {ProviderLogged, useLogged} from "./providers/isLogged";
import Home from "./component/pages/Home/Home";
import Login from "./component/pages/Login/Login";
import ForgetPassword from "./component/pages/ForgetPassword/ForgetPassword";
import Profile from "./component/pages/Profile/Profile";
import Register from "./component/pages/Register/Register";
import Studio from "./component/pages/Studio/Studio";
import Navigation from "./component/layout/Navigation/Navigation";
import Header from "./component/layout/Header/Header";
import Trends from "./component/pages/Trends/Trends";
import Channels from "./component/pages/Channels/Channels";
import Subscriptions from "./component/pages/Subscriptions/Subscriptions";
import Historic from "./component/pages/Historic/Historic";
import Playlists from "./component/pages/Playlists/Playlists";
import BackOffice from "./component/pages/Backoffice/Backoffice";
import Settings from "./component/pages/Settings/Settings";
import Watch from "./component/pages/Watch/Watch";
import Results from "./component/pages/Results/Results";
import Embed from "./component/pages/Embed/Embed";
import RelatedTags from "./component/pages/RelatedTags/RelatedTags";
import SettingVideo from "./component/pages/SettingVideo/SettingVideo";
import SettingPlaylist from "./component/pages/SettingPlaylist/SettingPlaylist";

function AppRoutes() {
  const {userLogged, loading} = useLogged();

  if(loading) {
    return <p>A carregar...</p>
  } else if (userLogged) {       // USER LOGGED
    return <Switch>
      <Route path="/home" component={Home}/>
      <Route path="/trends" component={Trends}/>
      <Route path="/results" component={Results}/>
      <Route path="/channels" component={Channels}/>
      <Route path="/subscriptions" component={Subscriptions}/>
      <Route path="/historic" component={Historic}/>
      <Route path="/playlists" component={Playlists}/>
      <Route path="/settings" component={Settings}/>
      <Route path="/settingVideo" component={SettingVideo}/>
      <Route path="/settingPlaylist" component={SettingPlaylist}/>
      <Route path="/relatedTags" component={RelatedTags}/>
      <Route path="/profile/:channel_id" component={Profile}/>
      <Route path="/studio" component={Studio}/>
      <Route path="/watch" component={Watch}/>
      <Route path="/embed/:video_id" component={Embed}/>
      <Route path="/backOffice" component={BackOffice}/>
      <Redirect to={"/home"}/>
    </Switch>
  } else {
     return <Switch>
       <Route path="/home" component={Home}/>
       <Route path="/trends" component={Trends}/>
       <Route path="/results" component={Results}/>
       <Route path="/channels" component={Channels}/>
       <Route path="/relatedTags" component={RelatedTags}/>
       <Route path="/login" component={Login}/>
       <Route path="/forgetPassword" component={ForgetPassword}/>
       <Route path="/register" component={Register}/>
       <Route path="/profile/:channel_id" component={Profile}/>
       <Route path="/watch" component={Watch}/>
       <Route path="/embed/:video_id" component={Embed}/>
       <Redirect to={"/home"}/>
     </Switch>
  }
}

function App() {
  let SettingPlaylist;

  return (
      <ProviderLogged>
        <BrowserRouter>
          <div className="App">
            <Header/>
            <div className='wrapper'>
              <Navigation/>
              <AppRoutes/>
            </div>
          </div>
        </BrowserRouter>
      </ProviderLogged>
  );
}

export default App;

/*
{page !== 'session' && <Navigation/>}
 */