const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const short = require("shortid");
const coverDirectory = "./public/profile_cover/";
const photoDirectory = "./public/profile_photo/";

router.post('/cover', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("There is no file to upload");
    }

    if (req.files.photo) {
        let uploadFile = req.files.photo;

        // MANIPULATE THE NAME OF THE RECEIVED FILE
        let baseName = uploadFile.name;
        let coverExt = path.parse(baseName).ext;
        let fileList = fs.readdirSync("./public/profile_cover");

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

        // UPDATE THE PATH IN THE DATA BASE
        const coverURL = `http://localhost:3001/profile_cover/${coverID}${coverExt}`

        const sql = `UPDATE user SET User_Cover = ? WHERE User_ID = ?`;
        await queryDB(sql, [coverURL, sessionIdUser]);
        res.json('Dados atualizados com sucesso!!!');
    }
});

router.post('/photo', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("There is no file to upload");
    }

    if (req.files.photo) {
        let uploadFile = req.files.photo;

        // MANIPULATE THE NAME OF THE RECEIVED FILE
        let baseName = uploadFile.name;
        let videoName = path.parse(baseName).name;
        let photoExt = path.parse(baseName).ext;

        let fileList = fs.readdirSync("./public/profile_photo/");

        // CREATING AN ID FOR VIDEO AND CHECKING IF IT ALREADY EXIST
        let photoID = '';
        let exist = false;
        do {
            exist = false;
            photoID = short();
            fileList.map(v => {
                if(photoID === path.parse(v).name)
                    exist = true;
            })
        } while (exist);

        const photoPath = photoDirectory + photoID + photoExt;

        // UPLOAD OF THE VIDEO INSIDE THE FOLDER
        await uploadFile.mv(photoPath, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
        });
        
        // UPDATE THE PATH IN THE DATA BASE
        const photoURL = `http://localhost:3001/profile_cover/${photoID}${photoExt}`

        const sql = `UPDATE user SET User_Photo = ? WHERE User_ID = ?`;
        await queryDB(sql, [photoURL, sessionIdUser]);

        res.json('Dados atualizados com sucesso!!!')
    }
});

router.post('/name_surname', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    const userName = req.body.userName;
    const userSurname = req.body.userSurname;

    let sql = ``;
    if(!userName) {
        sql = `UPDATE user SET User_Surname = ? WHERE User_ID = ?`;
        await queryDB(sql, [userSurname, sessionIdUser]);
    } else if (!userSurname) {
        sql = `UPDATE user SET User_Name = ? WHERE User_ID = ?`;
        await queryDB(sql, [userName, sessionIdUser]);
    } else {
        sql = `UPDATE user SET User_Name = ?, User_Surname = ? WHERE User_ID = ?`;
        await queryDB(sql, [userName, userSurname, sessionIdUser]);
    }
    res.json('Dados atualizados com sucesso!!!')
});


// FUNCTION TO DELETE THE CHANNEL ACCOUNT
router.post('/delete_account', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;

    const deleteAccount = 'DELETE FROM user WHERE User_ID = ?';
    try {
        await queryDB(deleteAccount, [sessionIdUser]);
        res.json('Channel removido com sucesso!');
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});


// USER SETTINGS - HIDE OR SHOW SOME PROFILE INFORMATION

router.get('/:channel_id', async function (req, res) {
    const channel_id = req.params.channel_id;
    const getSettings = `SELECT * FROM user_settings WHERE User_ID = ?`;
    let userSettings = await queryDB(getSettings, [channel_id]);
    console.log(userSettings)
    res.json(userSettings);
});

// ENDPOINT THAT SHOWS THE ACHIEVEMENTS IN THE USER LOGGED PROFILE
router.post('/show_achievements', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    console.log(sessionIdUser)
    const sql = `UPDATE user_settings SET Hide_Achievements = ? WHERE User_ID = ?`;
    await queryDB(sql, [null, sessionIdUser]);
});

// ENDPOINT THAT HIDES THE ACHIEVEMENTS IN THE USER LOGGED PROFILE
router.post('/hide_achievements', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    console.log(sessionIdUser)
    const sql = `UPDATE user_settings SET Hide_Achievements = ? WHERE User_ID = ?`;
    await queryDB(sql, [1, sessionIdUser]);
});


// ENDPOINT THAT SHOWS THE UPLOADS IN THE USER LOGGED PROFILE
router.post('/show_uploads', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    console.log(sessionIdUser)
    const sql = `UPDATE user_settings SET Hide_Uploads = ? WHERE User_ID = ?`;
    await queryDB(sql, [null, sessionIdUser]);
});

// ENDPOINT THAT HIDES THE UPLOADS IN THE USER LOGGED PROFILE
router.post('/hide_uploads', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    console.log(sessionIdUser)
    const sql = `UPDATE user_settings SET Hide_Uploads = ? WHERE User_ID = ?`;
    await queryDB(sql, [1, sessionIdUser]);
});

// ENDPOINT THAT SHOWS THE PLAYLISTS IN THE USER LOGGED PROFILE
router.post('/show_playlists', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    console.log(sessionIdUser)
    const sql = `UPDATE user_settings SET Hide_Playlists = ? WHERE User_ID = ?`;
    await queryDB(sql, [null, sessionIdUser]);
});

// ENDPOINT THAT HIDES THE PLAYLISTS IN THE USER LOGGED PROFILE
router.post('/hide_playlists', async function (req, res) {
    // GET THE USER LOGGED IN THE REQ.SESSION
    if (!req.session.id_user) {
        res.status(401).send("Faça o login WITHCREDENTIALS: TRUE!!!");
        return;
    }
    const sessionIdUser = req.session.id_user;
    console.log(sessionIdUser)
    const sql = `UPDATE user_settings SET Hide_Playlists = ? WHERE User_ID = ?`;
    await queryDB(sql, [1, sessionIdUser]);
});

module.exports = router;