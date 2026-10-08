const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

// FUNCTION TO GET THE LIST OF ALL VIEWS IN EACH VIDEO OF A CHANNEL
router.post('/add', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    const sessionIdUser = req.session?.id_user;
    const videoId = req.body.videoId;
    const sql = `INSERT INTO view SET ?`;

    if(videoId === null) {
        res.json('Não foi possível adicionar visualização!');
        return;
    }

    if(sessionIdUser) {
        await queryDB(sql, {Video_ID: videoId, User_ID: sessionIdUser});
    } else {
        await queryDB(sql, {Video_ID: videoId});
    }
    res.json('Visualização adicionada com sucesso!');
});

// FUNCTION TO GET THE LIST OF ALL VIEWS IN EACH VIDEO OF A CHANNEL
router.post('/channel', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    const sessionIdUser = req.session?.id_user;
    const channelId = req.body.channelId;
    const sql = `INSERT INTO view SET ?`;

    if(channelId === null) {
        res.json('Não foi possível adicionar visualização!');
        return;
    }

    if(sessionIdUser) {
        await queryDB(sql, {Channel_ID: channelId, User_ID: sessionIdUser});
    } else {
        await queryDB(sql, {Channel_ID: channelId});
    }
    res.json('Visualização adicionada com sucesso!');
});

module.exports = router;