const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT;

const cookieParser = require('cookie-parser');
const { getUserDataCookie } = require('./helpers/cookies');

app.use(cors());                                    //Cors
app.use(express.static(__dirname + '/public'));     //Carpeta static

app.set('view engine', 'ejs');                      //Template engine
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: false }));   // Parse application/x-www-form-urlencoded
app.use(express.json());                            // Parse application/json

app.use(cookieParser());                            //Cookies


//Rutas
app.use('/', require('./routers/routersFront'));        //Front
app.use('/user', require('./routers/routerUsers'));     //Users
app.use('/admin', require('./routers/routerAdmin'));    //Admin

//Awake
app.use('/wakeup', (req, res) => {
    
    console.log(`I'm awake (Blog - Front)`);

    res.status(200).json({
        ok: true,
        msg: `I'm awake (Blog - Front)`
    });

});


//404

app.use(async (req, res) => {
    const user = await getUserDataCookie(req, res);

    res.status(404).render('404', {
        urlTitle: '404 - Página no encontrada',
        error: '404',
        msg: 'Página no encontrada.',
        user
    })
});


app.listen(port, () => console.log(`Server listenning on port ${port}...`));