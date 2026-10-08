const {queryDB} = require("../connection");
const express = require('express');
const router = express.Router();
const short = require('shortid');
const fs = require('fs');
const path = require('path');
const videoDirectory = "./public/video/";
const thumbnailDirectory = "./public/thumbnail/";
const { getVideoDurationInSeconds } = require('get-video-duration');

const coverDirectory = "./public/thumbnail/";

// npm i @ffmpeg-installer/ffmpeg
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);



// FUNCTION TO LIST ALL VIDEOS OF A CHANNEL - PUBLIC
router.get('/:channel_id/list', async function (req, res) {
    const sql = 'SELECT user.User_ID, user.User_Name, user.User_Surname, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR \', \') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID WHERE v.Channel_ID = ? AND LOWER(v.Video_Title) LIKE LOWER(?) GROUP by v.Video_ID UNION SELECT user.User_ID, user.User_Name, user.User_Surname, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR \', \') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID WHERE v.Channel_ID = ? GROUP by v.Video_ID HAVING GROUP_CONCAT(vt.Tag_Name) LIKE LOWER(?)'
    try {
        let videoInfo = await queryDB(sql, [req.params.channel_id, '%' + req.query.search + '%', req.params.channel_id, '%' + req.query.search + '%']);
        //console.log(videoInfo);
        res.json(videoInfo);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

// FUNCTION TO LIST ALL VIDEOS OF A CHANNEL - PUBLIC
router.get('/all', async function (req, res) {
    const sql = 'SELECT user.User_ID, user.User_Name, user.User_Surname, CONCAT(user.User_Name, \' \', user.User_Surname) as userName, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR \', \') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID WHERE LOWER(v.Video_Title) LIKE LOWER(?) OR LOWER(CONCAT(user.User_Name, \' \', user.User_Surname)) LIKE LOWER(?) GROUP by v.Video_ID';
    try {
        let videoInfo = await queryDB(sql, ['%' + req.query.search + '%', '%' + req.query.search + '%']);
        res.json(videoInfo);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

// LIST THE DATA OF THE WATCHING VIDEO - PUBLIC
router.get('/watching', async function (req, res) {
    const videoId = req.query.Video_ID;
    const sql = `SELECT user.User_ID, user.User_Name, user.User_Surname, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR ', ') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID WHERE v.Video_ID = ?`;
    let videoWatching = await queryDB(sql, [videoId]);
    res.json(videoWatching);
});


// http://localhost:3001/video/list - Frontend
// FUNCTION TO LIST ALL FILTERED VIDEOS - PUBLIC
router.get('/list', async function (req, res) {
    const sql = 'SELECT user.User_ID, user.User_Name, user.User_Surname, CONCAT(user.User_Name, \' \', user.User_Surname) as userName, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR \', \') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID WHERE LOWER(v.Video_Title) LIKE LOWER(?) OR LOWER(CONCAT(user.User_Name, \' \', user.User_Surname)) LIKE LOWER(?) GROUP by v.Video_ID UNION SELECT user.User_ID, user.User_Name, user.User_Surname, CONCAT(user.User_Name, \' \', user.User_Surname) as userName, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR \', \') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID GROUP by v.Video_ID HAVING GROUP_CONCAT(vt.Tag_Name) LIKE LOWER(?)';
    //const sql = 'SELECT v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR \', \') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID WHERE LOWER(v.Video_Title) LIKE LOWER(?) GROUP by v.Video_ID UNION SELECT v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR \', \') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID GROUP by v.Video_ID HAVING GROUP_CONCAT(vt.Tag_Name) LIKE LOWER(?)';
    try {
        let videoInfo = await queryDB(sql, ['%' + req.query.search + '%', '%' + req.query.search + '%', '%' + req.query.search + '%']);
        res.json(videoInfo);
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});


// FUNCTION TO LIST ALL VIDEOS OF A CHANNEL - PUBLIC
router.get('/:video_id/more_viewed', async function (req, res) {
    const video_id = req.params.video_id;
    const getChannel = `SELECT Channel_ID FROM video WHERE Video_ID = ?`;
    let channel_id = await queryDB(getChannel, [video_id]);

    if(channel_id?.length > 0) {
        channel_id = channel_id[0].Channel_ID;
        const sql = `SELECT user.User_ID, user.User_Name, user.User_Surname, user.User_Photo, v.Video_ID, v.Video_Thumbnail, v.Video_Title, v.Video_Duration, v.Video_Post_Date, GROUP_CONCAT(vt.Tag_Name SEPARATOR ', ') as tags, views_videos.views, likes_videos.likes, dislikes_videos.dislikes, comments_videos.comments FROM video v LEFT JOIN video_tag vt ON v.Video_ID = vt.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as views FROM view GROUP by Video_ID) as views_videos ON views_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as comments FROM interaction WHERE Type_ID = 3 GROUP by Video_ID) as comments_videos ON comments_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as likes FROM interaction WHERE Type_ID = 1 GROUP by Video_ID) as likes_videos ON likes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT Video_ID, COUNT(*) as dislikes FROM interaction WHERE Type_ID = 2 GROUP by Video_ID) as dislikes_videos ON dislikes_videos.Video_ID = v.Video_ID LEFT JOIN (SELECT User_ID, User_Name, User_Surname, User_Photo FROM user) as user ON user.User_ID = v.Channel_ID WHERE v.Channel_ID = ? GROUP by v.Video_ID ORDER BY views_videos.views DESC`;
        try {
            let videoInfo = await queryDB(sql, [channel_id]);
            res.json(videoInfo);
        } catch (e) {
            res.status(400).json({message: "Erro: " + e})
        }
    }
});

// FUNCTION TO UPLOAD THE VIDEO AND CREATE 4 THUMBNAILS - LOGGED
router.post('/upload', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;

    // CHECKING IF SOME FILE HAS BEEN RECEIVED
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("There is no file to upload");
    }

    if (req.files.file) {
        let uploadFile = req.files.file;

        // MANIPULATE THE NAME OF THE RECEIVED FILE
        let baseName = uploadFile.name;
        let videoName = path.parse(baseName).name;
        let videoExt = path.parse(baseName).ext;

        let fileList = fs.readdirSync("./public/video/");

        // CREATING AN ID FOR VIDEO AND CHECKING IF IT ALREADY EXIST
        let videoID = '';
        let exist = false;
        do {
            exist = false;
            videoID = short();
            fileList.map(v => {
                if(videoID === path.parse(v).name)
                    exist = true;
            })
        } while (exist);

        const videoPath = videoDirectory + videoID + videoExt;
        const videoURL = 'http://localhost:3001/video/' + videoID + videoExt;

        // UPLOAD OF THE VIDEO INSIDE THE FOLDER
        await uploadFile.mv(videoPath, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
        });

        // VIDEO DURATION
        let videoDuration = 0;
        await getVideoDurationInSeconds(videoPath).then((duration) => {
            videoDuration = duration;
        })

        const sql = `SELECT Video_Max_Duration FROM settings`;
        const durationSettings = await queryDB(sql);
        const maxDuration = durationSettings[0].Video_Max_Duration;

        // CONVERT HH:MM:SS PARA SECONDS
        let array_HHMMSS = maxDuration.split(':');
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        let maxSeconds = (+array_HHMMSS[0]) * 60 * 60 + (+array_HHMMSS[1]) * 60 + (+array_HHMMSS[2]);

        if(videoDuration < maxSeconds) {
            // TIME MARKS TO CHOOSE FOUR THUMBNAILS - 0% - 30% - 60% - 100%
            let time1 = '1';
            let time2 = Math.floor(videoDuration * 30/100).toString();
            let time3 = Math.floor(videoDuration * 60/100).toString();
            let time4 = Math.floor(videoDuration).toString();

            // PUT THE PARAMETERS INSIDE OF AN OBJECT
            let reqParams = {
                Video_ID: videoID,
                Channel_ID: sessionIdUser, // req.user.id
                Video_URL: videoURL,
                Video_Duration: videoDuration
            }

            // CREATING THE THUMBNAILS AND ADDING THEM INSIDE THE OBJECT REQPARAMS
            // https://www.npmjs.com/package/ffmpeg
            let proc = new ffmpeg(videoURL)
                .on('filenames', async function(filenames) {
                    const setThumbnails = (filenames) => {
                        //reqParams.Video_Thumbnail = filenames.join();
                    }
                    setThumbnails(filenames);
                }).on('end', async function(end) {
                    res.status(200).json({video_id: videoID})
                })
                .takeScreenshots({
                    count: 4,
                    timemarks: [ time1, time2, time3, time4 ]
                },
                    thumbnailDirectory+videoID, function(err) {
                    });
            try {
                await queryDB("INSERT INTO video SET ?", reqParams).then(
                    resolve => console.log("resolve: ", resolve)
                ).catch(
                    reject =>console.log("reject: ", reject)
                )
            } catch (e) {
                res.status(400).json({message: "Error: " + e})
            }
        } else {
            res.status(400).json({message: 'A duração do vídeo excede a duração máxima permitida!'});
        }
    }
});

// UPDATE AFTER DRAG THE VIDEO - LOGGED
router.post('/update', async function(req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sql = `SELECT Forbidden_Words FROM settings`;
    let forbidden = await queryDB(sql);
    let forbiddenTags = forbidden[0].Forbidden_Words.split(',');

    let tags = await queryDB('SELECT * FROM tag');
    const tagsDB = tags.map(t => {
        return t.Tag_Name;
    })

    const videoTags = req.body.videoTag;
    console.log(videoTags + 'videoTags')

    // CHECK IF IT IS A NEW TAG TO BE ADDED IN THE DATA BASE AND IF IT IS NOT FORBIDDEN
    for(let t of videoTags) {
        if(!tagsDB.includes(t.Tag_Name) && !forbiddenTags.includes(t.Tag_Name)){
            await queryDB("INSERT INTO tag SET ?", t);
        }

        if(!forbiddenTags.includes(t.Tag_Name)){
            t.Video_ID = req.body.video_id;
            await queryDB("INSERT INTO video_tag SET ?", t);
        }
    }

    await queryDB("UPDATE video SET ? WHERE Video_ID = ? ", [req.body.videoInput, req.body.video_id]);
    tags = await queryDB('SELECT * FROM video_tag');
    res.json(tags);
});


// DELETE A VIDEO - LOGGED
router.post('/delete', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const videoId = req.body.videoId;
    const deleteVideo = `DELETE FROM video WHERE Video_ID = ?`;
    await queryDB(deleteVideo, [videoId]);

    // THIS ENDPOINT IS USED BY THE USER IN HIS OWN SETTINGS AND FOR THE BACKOFFICE TO EVALUATE A REPORT
    // SEND AN EMAIL TO CHANNEL ID AND USER ID SAYING THAT THE VIDEO HAS BEEN DELETED - SECOND CASE
    // MAYBE IS BETTER DOING TWO ENDPOINTS
    res.json('Vídeo deletado com sucesso!');
});

// SETTING OF EACH VIDEO - LOGGED
router.get('/current_info', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const videoId = req.query.videoId;
    const sql = `SELECT Video_ID, Video_Thumbnail, Video_Title, Video_Description, Private FROM video WHERE Video_ID = ?`;
    let videoInfo = await queryDB(sql, [videoId]);

    if(videoInfo.length > 0) {
        res.json(videoInfo);
    } else {
        res.status(400).send("Vídeo não encontrado!");
    }
});

// UPDATE THE TITLE OF A VIDEO - LOGGED
router.post('/update_title', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const videoId = req.body.videoId;
    const videoTitle = req.body.videoTitle;
    const sql = `UPDATE video SET Video_Title = ? WHERE Video_ID = ? `;
    await queryDB(sql, [videoTitle, videoId]);
    res.json('Atualização feita com sucesso!');
});

// UPDATE A VIDEO DESCRIPTION - LOGGED
router.post('/update_description', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const videoId = req.body.videoId;
    const videoDescription = req.body.videoDescription;
    const sql = `UPDATE video SET Video_Description = ? WHERE Video_ID = ? `;
    await queryDB(sql, [videoDescription, videoId]);
    res.json('Atualização feita com sucesso!');
});

// UPDATE A VIDEO PRIVACY - LOGGED
router.post('/update_privacy', async function (req, res) {
    const videoId = req.body.videoId;
    const videoPrivacy = req.body.videoPrivacy;
    const sql = `UPDATE video SET Private = ? WHERE Video_ID = ? `;
    await queryDB(sql, [videoPrivacy, videoId]);
    res.json('Atualização feita com sucesso!');
});

// UPDATE A VIDEO THUMBNAIL - LOGGED
router.post('/:videoId/update_thumbnail', async function (req, res) {
    // GET THE VIDEO ID AT URL
    const videoId = req.params.videoId;

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
        let coverExt = path.parse(baseName).ext;
        let fileList = fs.readdirSync(thumbnailDirectory);

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

        const coverPath = thumbnailDirectory + `/${videoId}/` + coverID + coverExt;
        const coverURL = `http://localhost:3001/thumbnail/${videoId}/${coverID}${coverExt}`;
        console.log(coverPath)

        // UPLOAD OF THE VIDEO INSIDE THE FOLDER
        await uploadFile.mv(coverPath, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
        });

        const sql = `UPDATE video SET Video_Thumbnail = ? WHERE Video_ID = ?`;
        await queryDB(sql, [coverURL, videoId]);
        res.json('Video Thumbnail atualizada com sucesso!');
    }
});

module.exports = router;