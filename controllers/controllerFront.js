const { fetchData } = require('../helpers/fetchData')
const { getURLs } = require('../configs/getURLs')

const { getUserDataCookie } = require('../helpers/cookies')

const fs = require('fs').promises;

/**
 * @author Pablo
 * @exports Object
 * @namespace controllerFront
 */


/**
 * Definición del tipo entriesData
 * @typedef {Object} entriesData
 * @memberof controllerFront
 * @property {String} urlTitle Título de la página
 * @property {String} msg Mensaje con información variable
 * @property {Array} entries Las entradas devueltas por la consulta
 */

/**
 * Definición del tipo entryData
 * @typedef {Object} entryData
 * @memberof controllerFront
 * @property {String} urlTitle Título de la página
 * @property {String} msg Mensaje con información variable
 * @property {Object} entry La entrada devuelta por la consulta
 */

/**
 * Definición del tipo User
 * @typedef {Object} User
 * @memberof controllerFront
 * @property {String | Number} id ID del usuario
 * @property {String} name Nombre del usuario
 * @property {String} email Email del usuario
 * @property {String} rol Rol del usuario
 */

/**
 * Renderiza en 'index' del user las entradas de la base de datos,
 * enviando un objeto :entriesData
 * @memberof controllerFront 
 * @method getEntries
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas
 * @param {Object} res Es la respuesta que proviene de las rutas    
 * @throws {json} Devuelve el error
 */
const getEntries = async (req, res) => {

    try {

        const { url, method } = getURLs('getEntries', req);

        const response = await fetchData(url, method);

        const user = await getUserDataCookie(req, res);

        if (!response.ok) {

            res.render('blog', {
                urlTitle: 'Blog: entradas',
                msg: '',
                entries: [],
                user
            });

        } else {

            const { data } = response;

            if (!data.msg.includes('No hay'))
                data.data.map(entry => {
                    entry.date = new Date(entry.date).toLocaleDateString();
                    entry.time = new Date(entry.date + ' ' + entry.time).toLocaleTimeString();
                });

            res.render('blog', {
                urlTitle: 'Blog: entradas',
                msg: '',
                entries: data,
                user
            });

        }


    } catch (e) {
        console.log('catchError en getEntries:', e);

        res.status(500).send({
            urlTitle: 'Blog: entradas',
            msg: `Error en getEntries: ${e}`
        });

    };
};


/**
 * Renderiza en el 'index' del user las entradas de la base de datos que coincidan con
 * la búsqueda de texto, enviando un objeto :entriesData.
 * @memberof controllerFront 
 * @method searchEntries
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas
 * @param {Object} res Es la respuesta que proviene de las rutas    
 * @throws {json} Devuelve el error
 */
const searchEntries = async (req, res) => {

    try {

        const { url, method } = getURLs('getEntriesBySearch', req);

        let { data } = await fetchData(url, method);

        if (data.ok) {

            let message;
            if (data.data) {

                message = req.body.text;

                data.data.map(entry => {
                    entry.date = new Date(entry.date).toLocaleDateString();
                    entry.time = new Date(entry.date + ' ' + entry.time).toLocaleTimeString();
                });

            } else {
                data = { ok: false };
                message = `Oh.. tu búsqueda: '${req.body.text}', no hay dado resultados...`;

            }

            const user = await getUserDataCookie(req, res);

            res.render('blog', {
                urlTitle: 'Blog: entradas - búsqueda',
                msg: message,
                entries: data,
                user
            });
        }

    } catch (e) {
        console.log('catchError en searchEntries:', e);

        res.status(500).send({
            urlTitle: 'Blog: entradas - búsqueda',
            msg: `Error en searchEntries: ${e}`
        });

    };
};


/**
 * Renderiza en el 'index' del user las entradas de la base de datos que coincidan con un email
 * específico, enviando un objeto :entriesData.
 * @memberof controllerFront 
 * @method searchEntriesByEmail
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas. Debe contener
 * params.email o body.email
 * @param {Object} res Es la respuesta que proviene de las rutas    
 * @throws {json} Devuelve el error
 */
const searchEntriesByEmail = async (req, res) => {

    try {
        console.log(req.body, req.params)
        if (req.body.email)
            req.params.email = req.body.email;

        else {

            const user = await getUserDataCookie(req, res);
            req.params.email = user.email;
        }

        console.log('email', req.params.email)

        const { url, method } = getURLs('getEntriesByEmail', req);

        let { data } = await fetchData(url, method);

        if (data.ok) {
            console.log('data', data)

            let message = `entradas de ${data.data[0].name}`;

            if (data.data)
                data.data.map(entry => {
                    entry.date = new Date(entry.date).toLocaleDateString();
                    entry.time = new Date(entry.date + ' ' + entry.time).toLocaleTimeString();
                })

            else {
                data = [];
                message = 'Aún no tienes publicaciones...'
            }

            const user = await getUserDataCookie(req, res);

            res.render('blog', {
                urlTitle: 'Blog: entradas - email',
                msg: message,
                entries: data,
                user
            });
        }

    } catch (e) {
        console.log('catchError en searchEntriesByEmail:', e);

        res.status(500).send({
            urlTitle: 'Blog: entradas - email',
            msg: `Error en searchEntriesByEmail: ${e}`
        });

    };
};


/**
 * Renderiza en 'detail' del user la entrada de la base de datos que coincide con un id
 * específico, enviando un objeto :entryData.
 * @memberof controllerFront 
 * @method getEntryByID
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas
 * @param {Object} res Es la respuesta que proviene de las rutas    
 * @throws {json} Devuelve el error
 */
const getEntryByID = async (req, res) => {

    try {

        const { url, method } = getURLs('getEntryByID', req);

        const { data } = await fetchData(url, method);

        if (data.ok) {

            const entry = data.data[0];

            entry.date = new Date(entry.date).toLocaleDateString();
            entry.time = new Date(entry.date + ' ' + entry.time).toLocaleTimeString();

            const user = await getUserDataCookie(req, res);

            res.render('detail', {
                urlTitle: 'Blog: entrada',
                entry,
                user
            });
        }

    } catch (e) {
        console.log('catchError en getEntryByID:', e);

        res.status(500).send({
            urlTitle: 'Blog: entrada',
            msg: `Error en getEntryByID: ${e}`
        });

    }
};


/**
 * Renderiza 'new' del user para crear una entrada nueva, se envía un Object :User.
 * @memberof controllerFront 
 * @method showNew
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas
 * @param {Object} res Es la respuesta que proviene de las rutas    
 */
const showNew = async (req, res) => {

    const user = await getUserDataCookie(req, res);

    res.render('new', {
        urlTitle: 'Blog: nueva',
        msg: '',
        entry: '',
        user
    });

};


/**
 * Recibe los datos para primero validar, y luego, crear una entrada nueva,
 * si las validaciones son correctas se redirige al 'index'.
 * En caso de errores se devuelven en un Object, y se renderiza el 'new'.
 * @memberof controllerFront 
 * @method createEntry
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas
 * @param {Object} res Es la respuesta que proviene de las rutas    
 * @throws {json} Devuelve el error
 */
const createEntry = async (req, res) => {

    try {

        if (req.file != undefined)
            req.body.image = req.file.filename;

        else
            req.body.image = '';

        const { url, method } = getURLs('postEntry', req);
        const { data } = await fetchData(url, method, req.body);

        if (data.ok)
            res.redirect('/');

        else {

            if (data.errors) {
                let err = {};
                const e = data.errors;

                if (e.title)
                    err.title = e.title.msg;

                if (e.content)
                    err.content = e.content.msg;

                if (e.extract)
                    err.extract = e.extract.msg;

                if (e.image)
                    err.image = e.image.msg;

                const user = await getUserDataCookie(req, res);

                res.render('new', {
                    entry: req.body,
                    msg: err,
                    urlTitle: 'Blog: nueva',
                    user
                });

            } else
                res.status(500).send({
                    urlTitle: 'Blog: error',
                    msg: `Error en createEntry`,
                    data
                });

        }

    } catch (e) {
        console.log('catchError en createEntry:', e);

        res.status(500).send({
            urlTitle: 'Blog: error',
            msg: `Error en createEntry: ${e}`
        });

    };
};


/**
 * Renderiza 'edit' del user para editar ña entrada que se especifica en el id, se envía un Object :entryData.
 * @memberof controllerFront 
 * @method showEdit
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas, debe contener
 * params.entryID con el id que se quiere buscar.
 * @param {Object} res Es la respuesta que proviene de las rutas    
 */
const showEdit = async (req, res) => {

    try {

        const { url, method } = getURLs('getEntryByID', req);

        const { data } = await fetchData(url, method);

        if (data.ok) {

            const entry = data.data[0];

            entry.date = new Date(entry.date).toLocaleDateString();
            entry.time = new Date(entry.date + ' ' + entry.time).toLocaleTimeString();

            const user = await getUserDataCookie(req, res)

            res.render('edit', {
                urlTitle: 'Blog: editar',
                msg: '',
                entry,
                user
            });

        }

    } catch (e) {
        console.log('catchError en showEdit:', e);

        res.status(500).send({
            urlTitle: 'Blog:  editar',
            msg: `Error en showEdit: ${e}`
        });

    };
};


/**
 * Recibe los datos para primero validar, y luego, modificar una entrada,
 * si las validaciones son correctas se redirige a 'detail'.
 * En caso de errores se devuelven en un Object, y se renderiza el 'edit'.
 * @memberof controllerFront 
 * @method editEntry
 * @async
 * @param {Object} req Es el requerimiento que proviene de las rutas
 * @param {Object} res Es la respuesta que proviene de las rutas    
 * @throws {json} Devuelve el error
 */
const editEntry = async (req, res) => {

    try {

        let oldPic = req.body.image;

        try {
            if (req.file != undefined)
                await fs.unlink(`./public/media/${oldPic}`);

        } catch (error) {

        } finally {

            if (req.file != undefined)
                req.body.image = req.file.filename;
            else
                req.body.image;
        }


        const { url, method } = getURLs('putEntry', req);
        const { data } = await fetchData(url, method, req.body);

        if (data.ok)
            res.redirect(`/detail/${req.body.entryID}`);

        else {

            if (data.errors) {
                let err = {};
                const e = data.errors;

                if (e.title)
                    err.title = e.title.msg;

                if (e.content)
                    err.content = e.content.msg;

                if (e.extract)
                    err.extract = e.extract.msg;

                if (e.image)
                    err.image = e.image.msg;

                const user = await getUserDataCookie(req, res);
                res.render('edit', {
                    entry: req.body,
                    msg: err,
                    user,
                    urlTitle: 'Blog: editar'
                });

            } else
                res.status(500).send({
                    urlTitle: 'Blog: error',
                    msg: `Error en editEntry`,
                    data
                });

        }

    } catch (e) {
        console.log('catchError en editEntry:', e);

        res.status(500).send({
            urlTitle: 'Blog: error',
            msg: `Error en editEntry: ${e}`
        });

    };
};


module.exports = {
    getEntries,
    searchEntries,
    searchEntriesByEmail,
    getEntryByID,
    showEdit,
    editEntry,
    showNew,
    createEntry
}