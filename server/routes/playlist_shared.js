const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

// FUNÇÃO PARA LISTAR OS BILHETES COM: NOME, APELIDO E CIDADES DE ORIGEM E DESTINO
router.get('/listar', async function (req, res) {
    let playlist_shared = await queryDB("SELECT * FROM playlist_shared");
    res.json(playlist_shared);
});

// http://localhost:3001/playlist/:channel_id/list - Frontend
// FUNCTION TO GET ALL THE PLAYLISTS OF A USER THAT HE IS A CONTRIBUTOR OF OTHER CHANNEL
router.get('/:channel_id/list', async function (req, res) {
    const sql = `SELECT ps.Playlist_Shared_ID, p.Playlist_ID, p.Playlist_Name, u.User_Name, u.User_Surname, u.User_Photo, p.Playlist_Thumbnail, p.Playlist_Post_Date, playlist_duration.duration FROM playlist_shared ps LEFT JOIN playlist p ON ps.Playlist_ID = p.Playlist_ID LEFT JOIN user u ON p.Playlist_Creator_ID = u.User_ID LEFT JOIN (SELECT vp.Playlist_ID, time_format( SEC_TO_TIME( SUM( TIME_TO_SEC( v.Video_Duration ) ) ),'%H:%i:%s') AS duration FROM video_playlist vp, video v WHERE v.Video_ID = vp.Video_ID GROUP BY vp.Playlist_ID) as playlist_duration ON playlist_duration.Playlist_ID = p.Playlist_ID WHERE ps.User_ID = ? AND (LOWER(p.Playlist_Name) LIKE LOWER(?) or LOWER(u.User_Name) LIKE LOWER(?))  GROUP by p.Playlist_ID`;
    try {
        let sharedInfo = await queryDB(sql, [req.params.channel_id, '%' + req.query.search + '%', '%' + req.query.search + '%']);
        res.json(sharedInfo);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
})

module.exports = router;