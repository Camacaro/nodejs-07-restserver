const express 	= require('express');
const bcrypt 	= require('bcrypt');
const jwt 		= require('jsonwebtoken');
const Usuario 	= require('../models/usuario');
const {OAuth2Client} = require('google-auth-library');


const app 	 = express();
const client = new OAuth2Client(process.env.CLIENT_ID);

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
					message: 'Usuario o (contraseña) incorrectos'	
				}
			});
		}

		// ==========
		// Generar token, Parametros:
		// data: payload o informacion por almacenar		
		// secret: verificacion de token, la firma de él
		// tiempo de expiracion, 60seg, 60hora, 24h, 30dias, para que expira en 30 dias
		// ==========
		let token = jwt.sign(
			{
				usuario:usuarioDB
			}, 
			process.env.SEED, 
			{
				expiresIn: process.env.CADUCIDAD_TOKEN
			}
		);

		res.json({
			ok:true,
			usuario: usuarioDB,
			token
		});
	});
});

// ==========
// Configuracion de google
// ==========

async function verify( token ) {

  	const ticket = await client.verifyIdToken({
      	idToken: token,
      	audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app 	that accesses the backend
      	// Or, if multiple clients access the backend:
      	//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  	});

  	const payload = ticket.getPayload();

  	return usuario = {
  		nombre: payload.name,
  		email:  payload.email,
  		img:    payload.picture,
  		google: true
  	}

  	/*console.log( payload.name )
  	console.log( payload.email )
  	console.log( payload.picture )*/
}

// ==========
// Post
// ==========
app.post('/google', async (req, res)=>{

	let token = req.body.idtoken;

	let googleUser = await verify( token )
	.catch( e => {
		return res.status(403).json({
			ok:false,
			err: e
		});
	});

	// ==========
	// Almacenar usuario a BD
	// ==========
	Usuario.findOne( {email: googleUser.email}, (err, usuarioDB) => {

		if(err){
			return res.status(500).json({
				ok:false,
				err
			});
		}

		if( usuarioDB ){
			if ( usuarioDB.google === false) {
				
				return res.status(400).json({
					ok:false,
					err:{
						message: "Debe usar su autenticacion normal"
					}
				});

			}else{

				let token = jwt.sign({
					usuario:usuarioDB
				},process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

				return res.status(200).json({
					ok:true,
					usuario:usuarioDB,
					token
				});
			}
		} else{
			// ==========
			// Si el usuario no existe en la DB
			// ==========
			let usuario = new Usuario();

			usuario.nombre 	= googleUser.nombre;
			usuario.email 	= googleUser.email;
			usuario.img 	= googleUser.img;
			usuario.google 	= true;
			usuario.password = ':)';

			usuario.save( (err,usuarioDB) => {

				if(err){
					return res.status(500).json({
						ok:false,
						err
					});
				}

				let token = jwt.sign({
					usuario:usuarioDB
				},process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

				return res.status(200).json({
					ok:true,
					usuario:usuarioDB,
					token
				});
			});
		}

	} );


	// ==========
	// Respuesta a la consola de google, de la pagina
	// ==========
	/*res.json({
		usuario: googleUser
	})*/
});


module.exports = app;