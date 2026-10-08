const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

router.get('/top_channels', async function (req, res) {
    const sql = `SELECT views_videos.Video_ID, views_videos.Video_Title, views_videos.Video_Thumbnail, views_videos.Video_Duration, views_videos.Private, u.User_Name, u.User_Surname, u.User_Photo, CONCAT(u.User_Name, ' ', u.User_Surname) AS userName, views_videos.views FROM user u, (SELECT v.Video_ID, v.Channel_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration, v.Private, v.Video_Post_Date, COUNT(vw.User_ID) AS views FROM video v, view vw WHERE v.Video_ID = vw.Video_ID GROUP by vw.Video_ID) AS views_videos WHERE u.User_ID = views_videos.Channel_ID ORDER BY views_videos.views DESC`;
    let topChannels = await queryDB(sql);
    res.json(topChannels);
})

module.exports = router;