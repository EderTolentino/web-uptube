const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

router.post('/related', async function (req, res) {
    const tagName = req.body.tagName;
    const sql = `SELECT user.User_ID, user.User_Name, user.User_Surname, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN (SELECT vt.Video_ID, vt.Tag_Name FROM video_tag vt) AS tag_video ON tag_video.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID WHERE tag_video.Tag_Name LIKE LOWER(?);`;
    let tagVideos = await queryDB(sql, [tagName]);
    res.json(tagVideos);
})

router.get('/list', async function (req, res) {
    let tag = await queryDB("SELECT * FROM tag");
    res.json(tag);
})

router.post('/insert', async function (req, res) {
    //VERIFY IF THE TAG IS IN THE DATA BASE
    let checkTag = await queryDB("SELECT * FROM tag WHERE Tag_Name = ?", [req.body.Tag_Name]);
    if (checkTag.length !== 0) {
        res.status(400).send("Esta tag já está na base de dados");
        return;
    }

    await queryDB("INSERT INTO tag SET ?", {
        Tag_Name: req.body.Tag_Name
    });
    let tag = await queryDB("SELECT * FROM tag");
    res.json(tag);
})

module.exports = router;