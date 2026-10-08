const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

// FUNCTION TO GET ALL LIKES OF A VIDEO
router.get('/likes_list', async function (req, res) {
// GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    let video_id = req.query.Video_ID;

    let getInteraction = 'SELECT i.Interaction_ID, it.Type FROM interaction i, interaction_type it WHERE i.Type_ID = it.Type_ID AND i.Type_ID <= 2 AND Video_ID = ? AND User_ID = ?';
    try {
        let likes = await queryDB(getInteraction, [video_id, sessionIdUser]);
        res.json(likes[0]);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.post('/set_likes', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    let video_id = req.body.Video_ID;
    let interaction = req.body.like;
    let type_id = 1;

    if(interaction === 'Dislike')
        type_id = 2;

    // VERIFY IF THIS USER HAS A LIKE OR DISLIKE INTERACTION WITH THIS VIDEO
    let getInteraction = 'SELECT i.Interaction_ID, it.Type FROM interaction i, interaction_type it WHERE i.Type_ID = it.Type_ID AND i.Type_ID <= ? AND i.Video_ID = ? AND i.User_ID = ?'
    let exist = await queryDB(getInteraction, [2, video_id, sessionIdUser]);

    // IF THERE IS NO INTERACTION YET - SET LIKE OR DISLIKE
    if(exist.length === 0) {
        const getChannel = `SELECT Channel_ID FROM video WHERE Video_ID = ?`;
        let channel_id = await queryDB(getChannel, [video_id]);
        channel_id = channel_id[0].Channel_ID;

        if(req.body.like === 'iLike') {
            await queryDB("INSERT INTO interaction SET ?", {
                Type_ID: 1,
                Channel_ID: channel_id,
                User_ID: sessionIdUser,
                Video_ID: video_id
            });
            res.json({Type: 'iLike'});
            return;
        } else {
            await queryDB("INSERT INTO interaction SET ?", {
                Type_ID: 2,
                Channel_ID: channel_id,
                User_ID: sessionIdUser,
                Video_ID: video_id
            });
            res.json({Type: 'Dislike'});
            return;
        }
    }

    // IF RECEIVE A LIKE AND THERE IS A LIKE TRUE IN THE DATA BASE - THEN DELETE INTERACTION
    // IF RECEIVE A DISLIKE AND THERE IS A DISLIKE TRUE IN THE DATA BASE - THEN DELETE INTERACTION
    if(interaction === exist[0].Type) {
        await queryDB("DELETE FROM interaction WHERE Type_ID = ? AND Video_ID = ? AND User_ID = ?", [type_id, video_id, sessionIdUser]);
        res.json(null);
        return;
    }

    // IF RECEIVE A LIKE AND THERE IS A DISLIKE TRUE IN THE DATA BASE - THEN SET DISLIKE NULL AND LIKE TRUE
    if(interaction === 'iLike' && exist[0].Type === 'Dislike') {
        await queryDB("UPDATE interaction SET Type_ID = ? WHERE Type_ID = ? AND Video_ID = ? AND User_ID = ?", [1, 2, video_id, sessionIdUser]);
        res.json({Type: 'iLike'});
        return;
    }

    // IF RECEIVE A DISLIKE AND THERE IS A LIKE TRUE IN THE DATA BASE - THEN SET LIKE NULL AND DISLIKE TRUE
    if(interaction === 'Dislike' && exist[0].Type === 'iLike') {
        await queryDB("UPDATE interaction SET Type_ID = ? WHERE Type_ID = ? AND Video_ID = ? AND User_ID = ?", [2, 1, video_id, sessionIdUser]);
        res.json({Type: 'Dislike'});
    }
});

// COMMENTS
router.post('/insert_comment', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const video_id = req.body.video_id;
    const comment = req.body.comment;

    const getChannel = `SELECT Channel_ID FROM video WHERE Video_ID = ?`;
    let channel_id = await queryDB(getChannel, [video_id]);
    channel_id = channel_id[0].Channel_ID;

    const insertComment = `INSERT INTO interaction SET Type_ID = ?, Channel_ID = ?, User_ID = ?, Video_ID = ?, Interaction_Text = ?`;
    await queryDB(insertComment, [3, channel_id, sessionIdUser, video_id, comment]);
    res.json(channel_id);
});

router.get('/comments', async function (req, res) {
    // GET THE USER ID FROM THE USER WHO HAS THE SESSION LOGGED
    const video_id = req.query.Video_ID;
    const getComments = `SELECT i.Interaction_ID, u.User_ID, u.User_Name, u.User_Surname, u.User_Photo, i.Interaction_Text, i.Interaction_Post_Date FROM interaction i, user u WHERE i.User_ID = u.User_ID AND i.Type_ID = 3 AND Video_ID = ? ORDER BY i.Interaction_Post_Date DESC`;
    let commentsData = await queryDB(getComments, [video_id]);
    res.json(commentsData);
});

router.post('/edit_comment', async function (req, res) {
    const comment = req.body.comment;
    const interactionId = req.body.interactionId;
    const editComment = `UPDATE interaction SET Interaction_Text = ? WHERE Interaction_ID = ?`;
    await queryDB(editComment, [comment, interactionId]);
    res.json('Comentário editado com sucesso!');
});

router.post('/delete_comment', async function (req, res) {
    const interactionId = req.body.interactionId;
    const deleteComment = `DELETE FROM interaction WHERE Interaction_ID = ?`;
    await queryDB(deleteComment, [interactionId]);
    res.json('Comentário deletado com sucesso!');
});

// TYPE_ID = 4 - REPORTS
// GET THE LIST OF ALL REPORTS TO BE EVALUATED
router.get('/reports', async function (req, res) {
    const getReports = `SELECT Interaction_ID, Channel_ID, User_ID, Video_ID FROM interaction WHERE Type_ID = ? ORDER BY Interaction_Post_Date DESC`;
    let reportList = await queryDB(getReports, [4]);
    res.json(reportList);
});

// GET THE USER ID FROM THE USER WHO HAS THE SESSION LOGGED
router.post('/insert_report', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const video_id = req.body.video_id;
    const report = req.body.reason;

    try {
        // VERIFY IF THIS USER HAS ALREAD ANY REPORT FOR THIS VIDEO - LIMIT OF 1 REPORT PER VIDEO
        const getReport = `SELECT Interaction_ID FROM interaction WHERE Type_ID = ? AND Video_ID = ? AND User_ID = ?`;
        let exist = await queryDB(getReport, [4, video_id, sessionIdUser]);
        if(exist.length > 0){
            res.json('Este utilizador já reportou este vídeo!');
            return;
        }

        const getChannel = `SELECT Channel_ID FROM video WHERE Video_ID = ?`;
        let channel_id = await queryDB(getChannel, [video_id]);
        channel_id = channel_id[0].Channel_ID;

        if(channel_id === sessionIdUser) {
            res.json('Não é permitido reportar o próprio vídeo!');
            return;
        }

        const insertReport = `INSERT INTO interaction SET Type_ID = ?, Channel_ID = ?, User_ID = ?, Video_ID = ?, Interaction_Text = ?`;
        await queryDB(insertReport, [4, channel_id, sessionIdUser, video_id, report]);
        res.json(req.body);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

// DELETE A REPORT
router.post('/delete_report', async function (req, res) {
    const interactionId = req.body.interactionId;
    const deleteReport = `DELETE FROM interaction WHERE Interaction_ID = ?`;
    await queryDB(deleteReport, [interactionId]);

    // SEND AN EMAIL TO CHANNEL ID AND USER ID SAYING THAT THE REPORT IS SOLVED

    res.json('Report deletado com sucesso!');
});

router.get('/subscriptions', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const getSubscription = `SELECT i.Interaction_ID, u.User_ID, u.User_Name, u.User_Surname, u.User_Photo FROM interaction i, user u WHERE i.Channel_ID = u.User_ID AND i.Type_ID = ? AND i.User_ID = ?`;
    let subscription = await queryDB(getSubscription, [5, sessionIdUser]);
    res.json(subscription);
});

router.get('/is_subscribed', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const video_id = req.query.Video_ID;
    const getChannel = `SELECT Channel_ID FROM video WHERE Video_ID = ?`;
    let channel_id = await queryDB(getChannel, [video_id]);
    channel_id = channel_id[0].Channel_ID;
    const getSubscription = `SELECT Interaction_ID FROM interaction WHERE Type_ID = ? AND Channel_ID = ? AND User_ID = ?`;
    let subscription = await queryDB(getSubscription, [5, channel_id, sessionIdUser]);
    res.json(subscription);
});

router.post('/insert_subscription', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const video_id = req.body.Video_ID;

    try {
        const getChannel = `SELECT Channel_ID FROM video WHERE Video_ID = ?`;
        let channel_id = await queryDB(getChannel, [video_id]);
        channel_id = channel_id[0].Channel_ID;

        if(channel_id === sessionIdUser){
            res.json('Não é possível subscrever em teu próprio canal!');
            return;
        }

        const getSubscription = `SELECT Interaction_ID FROM interaction WHERE Type_ID = ? AND Channel_ID = ? AND User_ID = ?`;
        let subscription = await queryDB(getSubscription, [5, channel_id, sessionIdUser]);
        if(subscription.length > 0){
            res.json('Este utilizador já está subscrito neste canal');
            return;
        }
        const insertSubscription = `INSERT INTO interaction SET Type_ID = ?, Channel_ID = ?, User_ID = ?`;
        await queryDB(insertSubscription, [5, channel_id, sessionIdUser]);
        res.json(req.body);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.post('/delete_subscription', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const video_id = req.body.Video_ID;
    try {
        const getChannel = `SELECT Channel_ID FROM video WHERE Video_ID = ?`;
        let channel_id = await queryDB(getChannel, [video_id]);
        channel_id = channel_id[0].Channel_ID;

        // IT WILL NEVER HAPPENS, BUT IT IS ONE MORE CHECK
        if(channel_id === sessionIdUser){
            res.json('Não é possível remover subscrição do teu próprio canal!');
            return;
        }

        const deleteSubscription = `DELETE FROM interaction WHERE Type_ID = ? AND Channel_ID = ? AND User_ID = ?`;
        await queryDB(deleteSubscription, [5, channel_id, sessionIdUser]);
        res.json('Subscrição cancelada com sucesso!');
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.post('/remove_subscription', async function (req, res) {
    const interaction_id = req.body.Interaction_ID;
    try {
        const deleteSubscription = `DELETE FROM interaction WHERE Interaction_ID = ?`;
        await queryDB(deleteSubscription, [interaction_id]);
        res.json('Subscrição cancelada com sucesso!');
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.get('/videos_subscriptions', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;

    const sql = `SELECT v.Video_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration, v.Private, u.User_Name, u.User_Surname, u.User_Photo, CONCAT(u.User_Name, ' ', u.User_Surname) AS userName FROM interaction i, video v, user u WHERE i.Channel_ID = v.Channel_ID AND u.User_ID = v.Channel_ID AND i.Type_ID = ? AND i.User_ID = ? ORDER BY v.Video_Post_Date DESC`;
    try {
        const lastVideos = await queryDB(sql, [5, sessionIdUser]);
        res.json(lastVideos);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});


//http://localhost:3001/user_settings/:channel_id/list - Frontend
// FUNCTION TO GET THE LIST OF ACHIEVEMENTS OF AN USER
router.get('/:channel_id/list', async function(req, res) {
    const channel_id = req.params.channel_id;
    const sql = `SELECT i.Interaction_ID, i.Type_ID, i.Channel_ID, achievement_data.Achievement_ID, achievement_data.Achievement_Name, achievement_data.Achievement_Item FROM interaction i LEFT JOIN (SELECT a.Achievement_ID, a.Achievement_Name, a.Achievement_Item FROM achievement a) as achievement_data ON achievement_data.Achievement_ID = i.Achievement_ID WHERE i.Channel_ID = ? AND i.Type_ID = ?`;
    let achievements = await queryDB(sql, [channel_id, 6]);
    res.json(achievements);
})

//http://localhost:3001/user_settings/:channel_id/list - Frontend
// FUNCTION TO GET THE LIST OF ACHIEVEMENTS OF AN USER
router.get('/notifications', async function(req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const sql = `SELECT i.Interaction_ID, i.Type_ID, i.Channel_ID, i.User_ID, i.Video_ID, i.Interaction_Post_Date, i.Viewed, user_data.User_Name, user_data.User_Surname, CONCAT(user_data.User_Name, ' ', user_data.User_Surname) as userName, user_data.User_Photo,  achievement_data.Achievement_ID, achievement_data.Achievement_Name, achievement_data.Achievement_Item FROM interaction i LEFT JOIN (SELECT u.User_ID, u.User_Name, u.User_Surname, u.User_Photo FROM user u) as user_data ON user_data.User_ID = i.User_ID LEFT JOIN (SELECT a.Achievement_ID, a.Achievement_Name, a.Achievement_Item FROM achievement a) as achievement_data ON achievement_data.Achievement_ID = i.Achievement_ID WHERE i.Channel_ID = ? ORDER BY i.Interaction_Post_Date DESC`;
    let achievements = await queryDB(sql, [sessionIdUser]);
    res.json(achievements);
})

// WORKING ON NOTIFICATIONS STATUS

// CHANGE THE VIEWED OF NEW NOTIFICATIONS FROM NULL TO 1
// THAT MEANS THE BELL HAS BEEN OPENED, BUT IT DOES NOT MEAN THE NOTIFICATION HAS BEEN CLICKED
router.post('/viewed', async function (req, res) {
    //const interactionId = req.body.interactionId;
    const setViewed = `UPDATE interaction SET Viewed = ? WHERE Viewed IS NULL`;
    await queryDB(setViewed, [1]);
    res.json('Iteração alterada com sucesso!');
});

// CHANGE THE VIEWED OF NEW NOTIFICATIONS FROM NULL OR 1 TO 2
// THAT MEANS THE NOTIFICATION HAS BEEN CLICKED
router.post('/opened', async function (req, res) {
    const interactionId = req.body.interactionId;
    const setOpened = `UPDATE interaction SET Viewed = ? WHERE Interaction_ID = ?`;
    await queryDB(setOpened, [2, interactionId]);
    res.json('Iteração alterada com sucesso!');
});

// CHANGE THE VIEWED OF NOTIFICATIONS FROM NULL, 1 OR 2 TO 3
// THAT MEANS THE USER DOES NOT WANT TO SEE THIS NOTIFICATION AGAIN
router.post('/hide', async function (req, res) {
    const interactionId = req.body.interactionId;
    const setHidden = `UPDATE interaction SET Viewed = ? WHERE Interaction_ID = ?`;
    await queryDB(setHidden, [3, interactionId]);
    res.json('Iteração alterada com sucesso!');
});

// ACHIEVEMENTS FUNCTIONS - VALUES TO BE EDITED AT SETTING TABLE '1,3,5,1,3,5,1,3,5'
// CHECK HOW MANY LIKES THIS CHANNEL HAS - STAR (1) / RISING STAR (3) / SUPER STAR (5)
router.post('/achievementsChecker', async function (req, res) {
    const channelId = req.body.channel;

    // ARRAY OF MINIMUN VALUES TO GET AN ACHIEVEMENT
    const achievementSettings = `SELECT Set_Achievements FROM settings`;
    const settingValues = await queryDB(achievementSettings);
    const values = settingValues[0].Set_Achievements.replaceAll(' ', '').split(',');

    // LIST OF RESPECTIVE ID ACHIEVEMENTS
    const sqlAchievements = `SELECT Achievement_ID FROM achievement`;
    const achievements = await queryDB(sqlAchievements);
    let achievementItem = [];
    achievements.map(a => {
        achievementItem.push(a.Achievement_ID);
    })

    // LIST OF ACHIEVEMENTS THAT AN USER HAS
    const sqlUserAchievements = `SELECT Achievement_ID FROM interaction WHERE Channel_ID = ? AND Type_ID = ?`;
    const userAchievements = await queryDB(sqlUserAchievements, [channelId, 6]);
    const conqueredAchievements = [];
    userAchievements.map(a => {
        conqueredAchievements.push(a.Achievement_ID);
    })

    const sqlView = `SELECT views_videos.views FROM user u, (SELECT v.Video_ID, v.Channel_ID, v.Video_Title, v.Video_Thumbnail, v.Video_Duration, v.Private, v.Video_Post_Date, COUNT(vw.User_ID) AS views FROM video v, view vw WHERE v.Video_ID = vw.Video_ID GROUP by vw.Video_ID) AS views_videos WHERE u.User_ID = views_videos.Channel_ID AND u.User_ID = ? ORDER BY views_videos.views DESC`;
    let views = await queryDB(sqlView, [channelId]);
    views = views[0]?.views || 0

    const sqlLikes = `SELECT COUNT(Interaction_ID) AS likes FROM interaction WHERE Channel_ID = ? AND Type_ID = ?`;
    let likes = await queryDB(sqlLikes, [channelId, 1]);
    likes = likes[0].likes;

    const sqlFollowers = `SELECT COUNT(Interaction_ID) AS followers FROM interaction WHERE Channel_ID = ? AND Type_ID = ?`;
    let followers = await queryDB(sqlFollowers, [channelId, 5]);
    followers = followers[0].followers;

    const achievementCheck = [followers, followers, followers, views, views, views, likes, likes, likes];
    let allAchievementsList = [];

    for(let i = 0; i < values.length; i++) {
        console.log(achievementCheck[i] + '  ' + values[i] )
        if(achievementCheck[i] > values[i]) {
            allAchievementsList.push(achievementItem[i])
        }
    }

    let newAchievements = [];
    allAchievementsList.map(a => {
        if(!conqueredAchievements.includes(a))
            newAchievements.push(a);
    })

    res.json(newAchievements);
});

module.exports = router;