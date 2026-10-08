const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

router.get('/settings', async function (req, res) {
    let settings = await queryDB("SELECT * FROM settings");
    res.json(settings);
});

router.get('/all_users', async function (req, res) {
    const sql = `SELECT User_ID, User_Name, User_Surname, User_Photo, User_Adm FROM user`;
    let allUsers = await queryDB(sql);
    res.json(allUsers);
});

router.post('/set_adm', async function (req, res) {
    const setUserAdmin = req.body.userId;
    const sql = `UPDATE user SET User_Adm = 1 WHERE User_ID = ?`;
    let setAdm = await queryDB(sql, [setUserAdmin]);
    res.json(setAdm);
});

router.post('/remove_adm', async function (req, res) {
    const removeUserAdmin = req.body.userId;
    const sql = `UPDATE user SET User_Adm = 0 WHERE User_ID = ?`;
    let setAdm = await queryDB(sql, [removeUserAdmin]);
    res.json(setAdm);
});

router.post('/update_forbidden_words', async function (req, res) {
    const forbiddenWords = req.body.forbiddenWords;
    const updateForbiddenWords = `UPDATE settings SET Forbidden_Words = ?`;
    await queryDB(updateForbiddenWords, [forbiddenWords]);
    res.json('Palavras proibidas atualizadas com sucesso!');
});

router.post('/update_max_duration', async function (req, res) {
    const maxDuration = req.body.maxDuration;
    const updateMaxDuration = `UPDATE settings SET Video_Max_Duration = ?`;
    await queryDB(updateMaxDuration, [maxDuration]);
    res.json('Palavras proibidas atualizadas com sucesso!');
});

module.exports = router;