const express = require("express");
const {queryDB} = require("../connection");
const path = require("path");
const fs = require("fs");
const short = require("shortid");
const router = express.Router();

const coverDirectory = "./public/avatar/";

router.get('/current_info', async function (req, res) {
    const playlistId = req.query.Playlist_ID;
    const sql = `SELECT Playlist_ID, Playlist_Thumbnail, Playlist_Name, Private FROM playlist WHERE Playlist_ID = ?`;
    let playlistInfo = await queryDB(sql, [playlistId]);

    if(playlistInfo.length > 0) {
        res.json(playlistInfo);
    } else {
        res.status(400).send("Playlist não encontrada!");
    }
});

// http://localhost:3001/playlist/:channel_id/list - Frontend
// FUNCTION TO GET ALL THE PLAYLISTS OF A CHANNEL
router.get('/:channel_id/list', async function (req, res) {

    const sql = `SELECT p.Playlist_ID, p.Playlist_Name, u.User_Name, u.User_Surname, CONCAT(u.User_Name, ' ', u.User_Surname) as userName, u.User_Photo, p.Playlist_Thumbnail, playlist_duration.duration, p.Playlist_Post_Date FROM playlist p LEFT JOIN user u ON p.Playlist_Creator_ID = u.User_ID LEFT JOIN (SELECT vp.Playlist_ID, time_format( SEC_TO_TIME( SUM( TIME_TO_SEC( v.Video_Duration ) ) ),'%H:%i:%s') AS duration FROM video_playlist vp, video v WHERE v.Video_ID = vp.Video_ID GROUP BY vp.Playlist_ID) as playlist_duration ON playlist_duration.Playlist_ID = p.Playlist_ID WHERE p.Playlist_Creator_ID = ? AND (LOWER(p.Playlist_Name) LIKE LOWER(?) or LOWER(CONCAT(u.User_Name, ' ', u.User_Surname)) LIKE LOWER(?)) GROUP by p.Playlist_ID`;
    try {
        let playlistInfo = await queryDB(sql, [req.params.channel_id, '%' + req.query.search + '%', '%' + req.query.search + '%']);
        res.json(playlistInfo);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

// http://localhost:3001/playlist/list - Frontend
// FUNCTION TO GET ALL FILTERED PLAYLISTS
router.get('/list', async function (req, res) {
    const sql = `SELECT p.Playlist_ID, p.Playlist_Name, u.User_Name, u.User_Surname, u.User_Photo, p.Playlist_Thumbnail, playlist_duration.duration, p.Playlist_Post_Date FROM playlist p LEFT JOIN user u ON p.Playlist_Creator_ID = u.User_ID LEFT JOIN (SELECT vp.Playlist_ID, time_format( SEC_TO_TIME( SUM( TIME_TO_SEC( v.Video_Duration ) ) ),'%H:%i:%s') AS duration FROM video_playlist vp, video v WHERE v.Video_ID = vp.Video_ID GROUP BY vp.Playlist_ID) as playlist_duration ON playlist_duration.Playlist_ID = p.Playlist_ID WHERE (LOWER(p.Playlist_Name) LIKE LOWER(?) or LOWER(u.User_Name) LIKE LOWER(?)) GROUP by p.Playlist_ID`;
    try {
        let playlistInfo = await queryDB(sql, ['%' + req.query.search + '%', '%' + req.query.search + '%']);
        res.json(playlistInfo);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.get('/names', async function (req, res) {
    let playlists = await queryDB("SELECT Playlist_Name FROM playlist");
    res.json(playlists);
});

// CREATE PLAYLIST
router.post('/create', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const playlistName = req.body.playlistName;
    let privacy = true;
    if (req.body.private === 'public') {
        privacy = null;
    }
    const thumbDefault = `http://localhost:3001/default/playlistThumbDefault.jpg`;
    const createPlaylist = `INSERT INTO playlist SET Playlist_Creator_ID = ?, Playlist_Name = ?, Playlist_Thumbnail = ?, Private = ?`;
    await queryDB(createPlaylist, [sessionIdUser, playlistName, thumbDefault, privacy]);
    res.json(req.body);
});

// UPDATE THE TITLE OF A VIDEO - LOGGED
router.post('/update_name', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const playlistId = req.body.playlistId;
    const playlistName = req.body.playlistName;
    const sql = `UPDATE playlist SET Playlist_Name = ? WHERE Playlist_ID = ? `;
    await queryDB(sql, [playlistName, playlistId]);
    res.json('Atualização feita com sucesso!');
});

// UPDATE A VIDEO PRIVACY - LOGGED
router.post('/update_privacy', async function (req, res) {
    const playlistId = req.body.playlistId;
    const playlistPrivacy = req.body.playlistPrivacy;
    const sql = `UPDATE playlist SET Private = ? WHERE Playlist_ID = ? `;
    await queryDB(sql, [playlistPrivacy, playlistId]);
    res.json('Atualização feita com sucesso!');
});

// UPDATE A VIDEO THUMBNAIL - LOGGED
router.post('/update_thumbnail', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("There is no file to upload");
    }

    if (req.files.photo) {
        let uploadFile = req.files.photo;

        // MANIPULATE THE NAME OF THE RECEIVED FILE
        let baseName = uploadFile.name;
        let videoName = path.parse(baseName).name;
        let coverExt = path.parse(baseName).ext;

        let fileList = fs.readdirSync("./public/avatar/");

        // CREATING AN ID FOR VIDEO AND CHECKING IF IT ALREADY EXIST
        let coverID = '';
        let exist = false;
        do {
            exist = false;
            coverID = short();
            fileList.map(v => {
                if(coverID === path.parse(v).name)
                    exist = true;
            })
        } while (exist);

        const coverPath = coverDirectory + coverID + coverExt;

        // UPLOAD OF THE VIDEO INSIDE THE FOLDER
        await uploadFile.mv(coverPath, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
        });
    }
});

// DELETE A PLAYLIST - LOGGED
router.post('/delete', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const playlistId = req.body.playlistId;
    const sql = `DELETE FROM playlist WHERE Playlist_ID = ?`;
    await queryDB(sql, [playlistId]);

    res.json('Playlist deletada com sucesso!');
});

module.exports = router;