const {queryDB, connection} = require("./connection");
require('dotenv').config();
const express = require("express");
const PORT = 3001;
const app = express();
const session = require("express-session");
const FileStore = require('session-file-store')(session);
// Para x-www-form-urlencoded
app.use(express.urlencoded());
// Para json
app.use(express.json());

const fileUpload = require("express-fileupload");
const cors = require("cors");
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

app.use(cors());
process.on('error', function (err) {
    console.log(err);
});

//Para o Passport Nuno e João
const cookieSession = require("cookie-session");
//const express = require("express");
//const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth");
//const app = express();

//Para o Passport Nuno e João
//app.use(cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })  //dúvida na keys);


app.use(session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 60000
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
    })
);

app.use("/auth", authRoute);

///////

/*
// https://stackoverflow.com/questions/57009371/access-to-xmlhttprequest-at-from-origin-localhost3000-has-been-blocked
const corsOptions ={
    origin:'http://localhost:3001',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

 */

const path = require('node:path');
app.use(express.static('public'));


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, x-ijt");
    res.header('Access-Control-Allow-Credentials', "true");
    res.removeHeader('X-Frame-Options');

    if ('OPTIONS' === req.method) return res.sendStatus(200);
    next();
});

app.use(fileUpload(
    {
        fileSize: 500 * 1024 * 1024,
        abortOnLimit: true,
        useTempFiles : true,
        safeFileNames: true,
        preserveExtension: true,
        tempFileDir : './public/temp'
    }
));



app.use(function responseLogger(req, res, next) {

    const originalSendFunc = res.send.bind(res);
    res.send = function(body) {
        //console.log("originalUrl:");    // do whatever here
        //console.log(req.originalUrl);    // do whatever here
        return originalSendFunc(body);
    };
    next();
});


app.use("/backoffice", require("./routes/backoffice.js"));
app.use("/historic", require("./routes/historic.js"));
app.use("/interaction", require("./routes/interaction.js"));
app.use("/playlist", require("./routes/playlist.js"));
app.use("/playlist_shared", require("./routes/playlist_shared.js"));
app.use("/tag", require("./routes/tag.js"));
app.use("/user", require("./routes/user.js"));
app.use("/user_settings", require("./routes/user_settings.js"));
app.use("/video", require("./routes/video.js"));
app.use("/video_playlist", require("./routes/video_playlist.js"));
app.use("/video_tag", require("./routes/video_tag.js"));
app.use("/view", require("./routes/view.js"));
app.use("/tendencies", require("./routes/tendencies.js"));
app.use("/channels", require("./routes/channels.js"));

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

