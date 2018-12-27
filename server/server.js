require('./config/config');

const express 	= require('express');
const mongoose 	= require('mongoose');
// ==========
// Este paquete sirve para acomodar las rutas de archivos
// ==========
const ruta 		= require('path');

const app = express();

//paquete para obtener la data de una peticion post
var bodyParser = require('body-parser');

//las .use son middleware cada vez que se ejecute el codigo pasara por aqui
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// ==========
// Habilitar carpeta public
// el path lo que hace es acomodarme la ruta
// ==========
app.use( express.static( ruta.resolve( __dirname , 'public') ) );


/*impotamos y usamos el require, en este caso las rutas, configuracion global*/
app.use( require('./routes/index') )




/*Conexion a la db, el callback recibe el error o la respuesta, la base de datos cafe no existe pero mongodb la puede crear cuando se haga una insercion*/
mongoose.connect(process.env.URLDB, (err, rep)=>{
	if(err){
		throw err;
	}else{
		console.log('Base de datos ONLINE');
	}

});

app.listen(process.env.PORT, () => {
	console.log('Escuchando el puerto', process.env.PORT);
});