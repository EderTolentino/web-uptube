const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();

// FUNÇÃO PARA LISTAR OS BILHETES COM: NOME, APELIDO E CIDADES DE ORIGEM E DESTINO
router.get('/list', async function (req, res) {
    let video_tag = await queryDB("SELECT * FROM video_tag");
    res.json(video_tag);
});

// http://localhost:3001/video_tag/top - Frontend
// FUNCTION TO LIST THE MOST USED TAGS
router.get('/top', async function (req, res) {
    let sql = 'SELECT Tag_Name, COUNT(Video_ID) AS quantidade FROM video_tag GROUP BY Tag_Name ORDER BY quantidade DESC LIMIT ?';
    let video_tag = await queryDB(sql, [5]);
    res.json(video_tag);
});

module.exports = router;