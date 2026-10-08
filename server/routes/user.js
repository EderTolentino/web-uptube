const express = require("express");
const {queryDB} = require("../connection");
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const short = require('shortid');

// ENDPOINTS RECENTES - CUIDADO PARA ERROS AO JUNTAR COM A PARTE DE NUNO E JOÃO - PASSPORT
router.get('/:channel_id/about', async function (req, res) {
    // GET THE CHANNEL FROM THE URL
    const user_id = req.params.channel_id;
    const getInfo = `SELECT u.User_ID, u.User_Name, u.User_Surname, u.User_Photo, u.User_Cover, u.User_Description, u.User_Register_Date, user_videos.videos, user_playlists.playlists, user_views.views, user_subscriptors.subscriptors FROM user u LEFT JOIN (SELECT Channel_ID, COUNT(User_ID) as subscriptors FROM interaction WHERE Type_ID = ? AND Channel_ID = ? GROUP BY Channel_ID) as user_subscriptors ON user_subscriptors.Channel_ID = u.User_ID LEFT JOIN (SELECT Channel_ID, COUNT(Video_ID) as videos FROM video GROUP BY Channel_ID) as user_videos ON user_videos.Channel_ID = u.User_ID LEFT JOIN (SELECT User_ID, COUNT(View_ID) as views FROM view GROUP BY User_ID) as user_views ON user_views.User_ID = u.User_ID LEFT JOIN (SELECT Playlist_Creator_ID, COUNT(Playlist_ID) as playlists FROM playlist GROUP BY Playlist_Creator_ID) as user_playlists ON user_playlists.Playlist_Creator_ID = u.User_ID WHERE u.User_ID = ?`;
    let userInformation = await queryDB(getInfo, [5, user_id, user_id]);
    res.json(userInformation);
});

router.get('/list', async function (req, res) {
    let user = await queryDB("SELECT User_ID FROM user");
    res.json(user);
});

// http://localhost:3001/user/:channel_id/info - Frontend
// FUNCTION TO GET ALL INFORMATION ABOUT A CHANNEL TO FILL ITS PROFILE
router.get('/:channel_id/info', async function(req, res) {
    let channelInfo = await queryDB('SELECT User_ID, User_Name, User_Surname, User_Photo, User_Cover, User_Description FROM user WHERE User_ID = ?', [req.params.channel_id]);
    res.json(channelInfo);
})

router.get('/update', async function (req, res) {
    let user = await queryDB("SELECT * FROM user");
    res.json(user);
});

// http://localhost:3001/user/register - Frontend
// FUNCTION TO INSERT THE USER DATA ON REGISTER
router.post('/register', async function (req, res) {
    const email = req.body.User_Email;
    let password = req.body.User_Password;

    // VERIFY IF THE FULL NAME CONTAIN ONLY LETTERS AND SPACE
    let alphabetRegex = /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/;
    let inputName = req.body.User_Full_Name;
    let check = inputName.match(alphabetRegex);
    if (check === null) {
        res.status(400).send("Nome deve conter apenas letras e espaços!!!");
        return;
    }

    // VERIFY THE PASSWORD
    if (password.length < 6) {
        res.status(400).send("Password deve conter no mínimo 6 caracteres!!!");
        return;
    }
    password = await bcrypt.hash(password, 12);

    // VERIFY IF THE EMAIL IS REGISTERED IN THE DATA BASE
    // PODEMOS USAR * NESSE CASO OU É MELHOR TRAZER APENAS O ID???
    let registeredEmail = await queryDB("SELECT * FROM user WHERE User_Email = ?", [email]);
    if (registeredEmail.length !== 0) {
        res.status(400).send("E-mail já registado no UPTube!!!");
        return;
    }

    let fullName = req.body.User_Full_Name.trim().split(" ");
    let name = fullName[0];
    let surname = fullName[fullName.length - 1];
    let firstLetter = req.body.User_Full_Name[0].toLowerCase();

    // TOKEN TO BE USED TO VERIFY THE EMAIL
    const token = short();

    await queryDB("INSERT INTO user SET ?", {
        User_Full_Name: req.body.User_Full_Name,
        User_Name: name,
        User_Surname: surname,
        User_Email: req.body.User_Email,
        User_Password: password,
        User_Token: token,
        User_Photo: `http://localhost:3001/default/${firstLetter}.png`,
        User_Cover: `http://localhost:3001/default/default.png`,
    });

    const getID = `SELECT User_ID FROM user WHERE User_Email = ?`;
    let id = await queryDB(getID, [email]);
    id = id[0].User_ID;

    // SEND AN EMAIL TO BE VERIFIED
    const linkConfirm = `http://localhost:3001/user/confirm_email?check=${token}&code=${id}`;
    const linkCancel = `http://localhost:3001/user/delete_account?code=${id}`;

    // CREATE AN EMAIL TO UPTUBE GROUP1
    const uptubeEmail = process.env.SMTP_USER;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: uptubeEmail,
            pass: process.env.SMTP_PASSWORD
        }
    });

    var mailOptions = {
        from: uptubeEmail,
        to: email,
        subject: 'Verify your e-mail to complete the register!',
        text: `Oi ${name + ' ' + surname},
        Obrigado por registar seu endereço de e-mail ao UPTube. Confirme seu e-mail a partir do link abaixo para poder ativar sua conta!
        
        ${linkConfirm}
        
        Se esta não for a sua conta no UPTube ou se você nem tiver criado uma conta no UPTube, clique no link abaixo para remover seu endereço de e-mail desta conta.
        
        ${linkCancel}
        `
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    let user = await queryDB("select * from user");
    res.json(user);
});

// http://localhost:3001/user/confirm_email - Frontend
// FUNCTION TO CONFIRM THE EMAIL SENT TO THE REGISTERED USER WITH A TOKEN
router.get('/confirm_email', async function (req, res) {
    // NESSE CASO, A VARIÁVEL CONST É MAIS SEGURA QUE LET? - POIS NÃO PODE SER ALTERADA
    const token = req.query.check;
    const id = req.query.code;

    const check_token_id = 'SELECT User_Email FROM user WHERE User_ID = ? AND User_Token = ?';
    try {
        let match = await queryDB(check_token_id, [id, token,]);
        if(match.length > 0){
            const verified = 'UPDATE user SET User_Token = ?, User_Verified = ? WHERE User_ID = ?';
            await queryDB(verified, [null, true, id]);

            console.log(parseInt(id))
            const setID = parseInt(id);

            await queryDB("INSERT INTO user_settings SET ?", {
                User_ID: setID
            });

            res.json('E-mail verificado com sucesso!');
            return;
        }
        res.json('Não foi possível fazer a ativação da conta. Refaça o registo!');
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

// http://localhost:3001/user/delete_account - Frontend
// FUNCTION TO CONFIRM THE EMAIL SENT TO THE REGISTERED USER WITH A TOKEN
router.get('/delete_account', async function (req, res) {
    const id = req.query.code;
    const cancelAccount = 'DELETE FROM user WHERE User_ID = ?';
    try {
        await queryDB(cancelAccount, [id]);
        res.json('E-mail removido com sucesso!');
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.post("/login", async function (req, res) {
    console.log(req.body);
    try{
        let email = req.body.User_Email;
        let password = req.body.User_Password;

        let user = await queryDB('SELECT User_ID, User_Password FROM user WHERE User_Email = ? AND User_Verified = ?', [email, 1]);

        if (!user[0]) {
            res.status(401).send("Credenciais erradas");
            return;
        }
        user = user[0];

        let result = await bcrypt.compare(password, user.User_Password);
        if (!result) {
            res.status(401).send("Credenciais erradas");
            return;
        }
        // login
        req.session.id_user = user.User_ID;

        let loggedUser = await queryDB('SELECT User_ID, User_Name, User_Surname, User_Photo, User_Cover, User_Description, User_Adm FROM user WHERE User_ID = ?', [req.session.id_user]);
        console.log(loggedUser[0]);
        res.json({message: "Fez login", user: loggedUser});
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.get("/login/success", async function (req, res) {
    let provider = req.user.provider;
    try{
        let email = '';
        if(provider === 'google') {
            email = req.user._json.email;
        } else if (provider === 'github') {
            email = req.user.emails[0].value;
        }

        let user = await queryDB('SELECT User_ID, User_Password FROM user WHERE User_Email = ? AND User_Verified = ?', [email, 1]);

        if (!user[0]) {
            //res.status(401).send("O seu email não se encontra registado");
            req.session.destroy();  //Acrescentei isto visto que a sessão não estava bem distruida, e preciso dela para carregar novamente no botão do google
            res.redirect("http://localhost:3000/register");
            return;
        }
        user = user[0];

        // login
        req.session.id_user = user.User_ID;

        let loggedUser = await queryDB('SELECT User_ID, User_Name, User_Surname, User_Photo, User_Cover, User_Adm, User_Description FROM user WHERE User_ID = ?', [req.session.id_user]);

        res.redirect("http://localhost:3000/home");
    }
    catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

router.get("/logged_user", async function (req, res) {
    const sessionIdUser = req.session.id_user;

    if (!sessionIdUser) {
        res.send("Faça loginnnn");
        return;
    }
    let user = await queryDB('SELECT User_ID, User_Name, User_Surname, User_Photo, User_Cover, User_Adm, User_Description FROM user WHERE User_ID = ?', [sessionIdUser]);
    if (!user[0]) {
        res.send("Faça login (utilizador não encontradoooo)");
        return;
    }
    res.send(user[0]);
});

router.get("/session", async function (req, res) {
    const sessionIdUser = req.session.id_user;

    if (!sessionIdUser) {
        res.send("Faça login");
        return;
    }

    let user = await queryDB('SELECT User_ID, User_Name, User_Surname, User_Photo, User_Cover, User_Adm, User_Description FROM user WHERE User_ID = ?', [sessionIdUser]);

    if (!user[0]) {
        res.send("Faça login (utilizador não encontrado)");
        return;
    }
    res.send({user: user[0], session: req.session});
});

router.post("/logout", async function (req, res) {
    req.session.destroy();
    res.send('Logged out!');
});

router.post('/forgetPassword', async function (req, res) {
    const email = req.body.User_Email;
    //VERIFY IF THE E-MAIL IS IN THE DATA BASE
    let user = await queryDB("SELECT * FROM user WHERE User_Email = ?", [email]);
    if (user.length === 0) {
        res.status(400).send("This e-mail is not registered in UPTube!");
        return;
    }
    const token = short();

    //INSERT A TOKEN INTO THE DATABASE FOR THE RESPECTIVE E-MAIL
    await queryDB("UPDATE user SET User_Token = ? WHERE User_Email = ?", [token, email]);

    const uptubeEmail = process.env.SMTP_USER;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: uptubeEmail,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const getData = `SELECT User_ID, User_Name, User_Surname FROM user WHERE User_Email = ?`;
    let data = await queryDB(getData, [email]);
    id = data[0].User_ID;
    let name = data[0].User_Name;
    let surname = data[0].User_Surname;

    const linkReset = `http://localhost:3000/forgetPassword?check=${token}&code=${id}`;
    var mailOptions = {
        from: uptubeEmail,
        to: email,
        subject: 'Email para redefinir a password',
        text: `Oi ${name + ' ' + surname},
        Clique no link abaixo para poder redefinir sua password!
        
        ${linkReset}
        
        Se você não fez essa solicitação, ignore este e-mail. 
        Tenha certeza de que sua conta de cliente está segura.
        
        UPTube
        `
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.json(`Link para redefinir a password enviada para o e-mail ${email}`);
});

// http://localhost:3001/user/confirm_email - Frontend
// FUNCTION TO CONFIRM THE EMAIL SENT TO THE REGISTERED USER WITH A TOKEN
router.post('/reset_password', async function (req, res) {
    const token = req.body.User_Token;
    const id = req.body.User_ID;
    let password = req.body.User_Password;
    const check_token_id = 'SELECT User_ID FROM user WHERE User_ID = ? AND User_Token = ?';

    try {
        let match = await queryDB(check_token_id, [id, token,]);

        if(match.length > 0){
            // VERIFY THE PASSWORD
            if (password.length < 6) {
                res.status(400).send("Password deve conter no mínimo 6 caracteres!!!");
                return;
            }
            password = await bcrypt.hash(password, 12);

            const verified = 'UPDATE user SET User_Token = ?, User_Password = ? WHERE User_ID = ?';
            await queryDB(verified, [null, password, id]);
            res.json('Password redefinida com sucesso!');
            return;
        }

        res.json('Não foi possível redefinir a password. Peça um novo link de redefinição!');
    } catch (e) {
        res.status(400).json({message: "Erro: " + e})
    }
});

// DELETE A USER
router.post('/delete', async function (req, res) {
    const channelId = req.body.channelId;
    const deleteChannel = `DELETE FROM user WHERE User_ID = ?`;
    await queryDB(deleteChannel, [channelId]);
    res.json('Vídeo e utilizador deletados com sucesso!');
});

router.post('/inactivate', async function (req, res) {
    const channelId = req.body.channelId;
    const inactivateChannel = `UPDATE user SET User_Verified = ? WHERE User_ID = ?`;
    await queryDB(inactivateChannel, [null, channelId]);

    // SEND AN EMAIL TO CHANNEL ID AND USER ID SAYING THAT THE VIDEO AND THE CHANNEL HAD BEEN DELETED

    res.json('Canal inativado com sucesso!');
});

module.exports = router;