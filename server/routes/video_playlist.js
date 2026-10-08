const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

// LIST THE VIDEOS OF EACH PLAYLIST
router.get('/list', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const sql = `SELECT video_data.Video_Playlist_ID, p.Playlist_ID, p.Playlist_Name, video_data.Video_ID, video_data.Video_Title, video_data.Video_Thumbnail, video_data.Video_Duration, p.Private FROM playlist p LEFT JOIN (SELECT vp.Video_Playlist_ID, vp.Playlist_ID, v.Video_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration FROM video_playlist vp, video v WHERE vp.Video_ID = v.Video_ID) AS video_data ON video_data.Playlist_ID = p.Playlist_ID WHERE p.Playlist_Creator_ID = ? UNION SELECT video_data.Video_Playlist_ID, p.Playlist_ID, p.Playlist_Name, video_data.Video_ID, video_data.Video_Title, video_data.Video_Thumbnail, video_data.Video_Duration, p.Private  FROM playlist p LEFT JOIN playlist_shared ps ON ps.Playlist_ID = p.Playlist_ID LEFT JOIN (SELECT vp.Video_Playlist_ID, vp.Playlist_ID, v.Video_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration FROM video_playlist vp, video v WHERE vp.Video_ID = v.Video_ID) AS video_data ON video_data.Playlist_ID = p.Playlist_ID WHERE ps.User_ID = ?`;
    let video_playlist = await queryDB(sql, [sessionIdUser, sessionIdUser]);
    res.json(video_playlist);
});

// LIST THE VIDEOS OF AN CHOOSEN PLAYLIST TO WATCH
router.get('/watching', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const playlistId = req.query.Playlist_ID;
    const sql = `SELECT vp.Video_Playlist_ID, p.Playlist_ID, p.Playlist_Name, vp.Video_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration, p.Private FROM video_playlist vp, playlist p, video v WHERE vp.Playlist_ID = p.Playlist_ID AND vp.Video_ID = v.Video_ID AND p.Playlist_Creator_ID = ? AND p.Playlist_ID = ? UNION SELECT vp.Video_Playlist_ID, p.Playlist_ID, p.Playlist_Name, vp.Video_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration, p.Private FROM video_playlist vp, playlist p, playlist_shared ps, video v WHERE vp.Playlist_ID = p.Playlist_ID AND p.Playlist_ID = ps.Playlist_ID AND vp.Video_ID = v.Video_ID AND ps.User_ID = ? AND ps.Playlist_ID = ?`;
    let video_playlist = await queryDB(sql, [sessionIdUser, playlistId, sessionIdUser, playlistId]);
    res.json(video_playlist);
});

// ADD THE VIDEO
router.post('/add', async function (req, res) {
    const playlistId = req.body.playlistId;
    const videoId = req.body.videoId;
    const insertReport = `INSERT INTO video_playlist SET Playlist_ID = ?, Video_ID = ?`;
    await queryDB(insertReport, [playlistId, videoId]);
    res.json(req.body);
});

// REMOVE A VIDEO FROM A PLAYLIST
router.post('/delete', async function (req, res) {
    const playlistId = req.body.playlistId;
    const videoId = req.body.videoId;
    const deleteVideo = `DELETE FROM video_playlist WHERE Playlist_ID = ? AND Video_ID = ?`;
    await queryDB(deleteVideo, [playlistId, videoId]);
    res.json('Vídeo deletado com sucesso!');
});

module.exports = router;