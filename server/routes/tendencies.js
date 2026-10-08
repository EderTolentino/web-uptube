const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

// FUNCTION LISTIN THE AMOUNT OF VIEWS FOR EACH CHANNEL IN THE LAST 7 DAYS
router.get('/channel_views', async function (req, res) {
    const sql = `SELECT user.User_ID, user.User_Name, user.User_Surname, CONCAT(user.User_Name, ' ', user.User_Surname) AS userName, user.User_Photo, views_channel.views FROM user LEFT JOIN (SELECT View_ID, Channel_ID, Video_ID, COUNT(User_ID) AS views, datediff(date(now()),View_Date) AS date FROM view WHERE Channel_ID IS NOT NULL GROUP BY Channel_ID HAVING date < 7) AS views_channel ON views_channel.Channel_ID = user.User_ID WHERE views_channel.views IS NOT NULL ORDER BY views DESC`;
    const channelViews = await queryDB(sql);
    res.json(channelViews)
});

// FUNCTION LISTING THE AMOUNT OF VIEWS FOR EACH CHANNEL IN THE LAST 7 DAYS
router.get('/channel_followers', async function (req, res) {
    const sql = `SELECT user.User_ID, user.User_Name, user.User_Surname, CONCAT(user.User_Name, ' ', user.User_Surname) AS userName, user.User_Photo, followers_channel.followers FROM user LEFT JOIN (SELECT Channel_ID, COUNT(User_ID) AS followers, datediff(date(now()), Interaction_Post_Date) AS date FROM interaction WHERE Type_ID = ? GROUP BY Channel_ID) AS followers_channel ON followers_channel.Channel_ID = user.User_ID WHERE followers_channel.followers IS NOT NULL ORDER BY followers DESC`;
    const channelFollowers = await queryDB(sql, [5]);
    res.json(channelFollowers)
});

// FUNCTION LISTING THE AMOUNT OF LIKES FOR EACH CHANNEL IN THE LAST 7 DAYS
router.get('/channel_likes', async function (req, res) {
    const sql = `SELECT user.User_ID, user.User_Name, user.User_Surname, CONCAT(user.User_Name, ' ', user.User_Surname) AS userName, user.User_Photo, likes_channel.likes FROM user LEFT JOIN (SELECT Channel_ID, COUNT(User_ID) AS likes, datediff(date(now()), Interaction_Post_Date) AS date FROM interaction WHERE Type_ID = ? GROUP BY Channel_ID) AS likes_channel ON likes_channel.Channel_ID = user.User_ID WHERE likes_channel.likes IS NOT NULL ORDER BY likes DESC`;
    const channelLikes = await queryDB(sql, [1]);
    res.json(channelLikes)
});

// Função para listar na parte central videos segeridos ordenanos por mais views
router.get('/list', async function (req, res) {
    const sql = `SELECT * FROM video LEFT JOIN (SELECT View_ID, Video_ID, COUNT(User_ID) AS views, datediff(date(now()),View_Date) AS date FROM view WHERE Video_ID IS NOT NULL GROUP BY Video_ID HAVING date < 7) AS video_views ON video_views.Video_ID = video.Video_ID WHERE video_views.views IS NOT NULL`;
    const trendVideos = await queryDB(sql);
    res.json(trendVideos);
});

module.exports = router;