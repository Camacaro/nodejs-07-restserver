require('./config/config');

const express = require('express');
const app = express();

//paquete para obtener la data de una peticion post
var bodyParser = require('body-parser');

//las .use son middleware cada vez que se ejecute el codigo pasara por aqui
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());



//peticion GET - obtener registro - localhost:3000/usuario
app.get('/usuario', function (request, resuesta) {
	//enviar en formato html->send, formato json->json
	resuesta.json('get usuario');
});

//peticion POST - hacer registro - localhost:3000/usuario
app.post('/usuario', function (request, resuesta) {
	//este body es lo que me retornara el middleware
	let body = request.body;


	if( body.nombre === undefined ){
		//mandar status de respuesta
		resuesta.status(400).json({
			ok:false,
			mensaje:"El nombre es necesario"
		});
	}else {
		//enviar en formato html->send, formato json->json
		resuesta.json({
			path:'post usuario',
			body
		});
	}
	
});

//peticion PUT - actualizar registro - localhost:3000/usuario/:id
//:id -> parametro a recibir
app.put('/usuario/:id', function (request, resuesta) {
	//obtener parametro
	let parametro = request.params.id;
	//enviar en formato html->send, formato json->json
	resuesta.json({
		id:parametro,
		path:"put"
	});
});

//peticion DELETE - Borrar registro - localhost:3000/usuario
app.delete('/usuario', function (request, resuesta) {
	//enviar en formato html->send, formato json->json
	resuesta.json('delete usuario');
});

app.listen(process.env.PORT, () => {
	console.log('Escuchando el puerto', process.env.PORT);
});