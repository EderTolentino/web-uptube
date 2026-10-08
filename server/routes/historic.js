const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

router.get('/views', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const sql = `SELECT vw.View_ID, vw.Video_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration, v.Video_Post_Date, u.User_Name, u.User_Surname, CONCAT(u.User_Name, ' ', u.User_Surname) as userName, u.User_Photo, vw.View_Date FROM view vw, video v, user u WHERE vw.Video_ID = v.Video_ID AND v.Channel_ID = u.User_ID AND vw.User_ID = ? ORDER BY vw.View_Date DESC`;
    let historyViews = await queryDB(sql, [sessionIdUser]);
    res.json(historyViews);
});

//Função permite mostrar os videos em que o user deu like
router.get('/:user/likes', async function (req, res) {
    let channel_tendencies = await queryDB(`SELECT v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date FROM \`interaction\`, video as v WHERE User_ID=? AND interaction.Video_ID=v.Video_ID AND Type_ID=1`, [req.params.user]);
    res.json(channel_tendencies);
});

//Função permite mostrar os videos em que o user deu dislike
router.get('/:user/dislikes', async function (req, res) {
    let channel_tendencies = await queryDB(`SELECT v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date FROM \`interaction\`, video as v WHERE User_ID=? AND interaction.Video_ID=v.Video_ID AND Type_ID=2`, [req.params.user]);
    res.json(channel_tendencies);
});

//Função permite mostrar os videos em que o user visualizou
router.get('/:user/views', async function (req, res) {
    let channel_tendencies = await queryDB(`SELECT v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date FROM view, video as v WHERE view.User_ID=? AND view.Video_ID=v.Video_ID`, [req.params.user]);
    res.json(channel_tendencies);
});

module.exports = router;