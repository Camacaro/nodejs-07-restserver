const express 	= require('express');
const bcrypt 	= require('bcrypt');
const jwt 		= require('jsonwebtoken');
const Usuario 	= require('../models/usuario');

const app = express();

// ==========
// Post
// ==========
app.post('/login', (req, res)=>{
	
	let body = req.body;

	// ==========
	// Esta funcion sirve para buscar uno solo, si lo encuentra lo devuelve
	// sino lo retonar vacio o nulo
	// ==========
	Usuario.findOne({email:body.email}, (err, usuarioDB)=>{

		if(err){
			return res.status(500).json({
				ok:false,
				err
			});
		}
		
		if ( !usuarioDB ) {
			return res.status(400).json({
				ok:false,
				err: {
					message: '(Usuario) o contraseña incorrectos'	
				}
			});
		}

		// ==========
		// Aqui lo que hace es comparar los hash de las contraseña,
		// retorna un true si hace la coincidencia
		// ==========
		if( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
			return res.status(400).json({
				ok:false,
				err: {
					message: '(Usuario o (contraseña) incorrectos'	
				}
			});
		}

		// ==========
		// Generar token, Parametros:
		// data: payload o informacion por almacenar		
		// secret: verificacion de token, la firma de él
		// tiempo de expiracion, 60seg, 60hora, 24h, 30dias, para que expira en 30 dias
		// ==========
		let token = jwt.sign({
			usuario:usuarioDB
		}, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

		res.json({
			ok:true,
			usuario: usuarioDB,
			token
		});
	});
});


module.exports = app;