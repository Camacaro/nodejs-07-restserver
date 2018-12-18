const express 	= require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const app = express();

const Usuario = require('../models/usuario');

//peticion GET - obtener registro - localhost:3000/usuario
//peticion GET - obtener registro con parametro - localhost:3000/usuario?parametro=valor&OtroParametro=valor
app.get('/usuario', function (request, resuesta) {
	//enviar en formato html->send, formato json->json
	//resuesta.json('get usuario LOCAL');

	//sirve para obtener un parametro que puede ser opcional
	let desde = request.query.desde || 0;
	desde = Number(desde);

	let limite = request.query.limite || 5;
	limite = Number(limite);

	/*find es para encontrar registro, se puede mandar un objeto y servira como un where, el segundo parametro sirve como un select para mostrar los campos*/
	Usuario.find( {estado:true}, 'nombre email role estado google img' )
		.skip( desde )
		.limit( limite )
		.exec( (err, usuarios)=>{
			if(err){
				//mandar status de respuesta, 400: bad request
				return resuesta.status(400).json({
					ok:false,
					err
				});
			}

			Usuario.count({estado:true}, (err, conteo)=>{
				resuesta.json({
					ok:true,
					usuarios,
					cuantos: conteo
				});
			});

			
		})
});	

//peticion POST - hacer registro - localhost:3000/usuario
app.post('/usuario', function (request, resuesta) {
	//este body es lo que me retornara el middleware
	let body = request.body;

	/*Creando un usuario nuevo instaciado del modelo de la db*/
	/*el segundo parametro del hashSync es la vuelta de encriptacion*/
	let usuario = new Usuario({
		nombre : 	body.nombre,
		email : 	body.email,
		password : 	bcrypt.hashSync(body.password, 10),
		role : 		body.role
	});

	/*Insertar usuario,
	err: si ocurre algun error
	usuarioDB: retorno del usuario insertado*/
	usuario.save( (err, usuarioDB) => {
		if(err){
			//mandar status de respuesta, 400: bad request
			return resuesta.status(400).json({
				ok:false,
				err
			});
		}

		//quitando la password para el return
		//usuarioDB.password = null;

		resuesta.json({
			ok:true,
			usuario: usuarioDB
		});
	} );

	/*if( body.nombre === undefined ){
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
	}*/
	
});

//peticion PUT - actualizar registro - localhost:3000/usuario/:id
//:id -> parametro a recibir
app.put('/usuario/:id', function (request, resuesta) {
	//obtener parametro
	let parametro = request.params.id;

	//obtener el request
	//let body = request.body;

	//funcion para filtrar objetos
	//primer parametro el objeto 
	//objetos validos a devolver
	let body = _.pick( request.body, ['nombre','email','img','role','estado'] );


	/*
		borrar objetos en un json
		delete body.compo-u-objeto
	*/
	//busca por el id, y lo actualiza, el parametro objeto new es para que me retorne el usuario actualizado y no el anterior, runValidators es para que valide todas las validaciones del schema
	Usuario.findByIdAndUpdate( parametro, body, {new:true, runValidators:true}, (err, usuarioDB) => {

		if(err){
			//mandar status de respuesta, 400: bad request
			return resuesta.status(400).json({
				ok:false,
				err
			});
		}

		resuesta.json({
			ok:true,
			usuario: usuarioDB
		});
		
	} );

	//encontrar usuario, con la funcion de mongodb
	//con esta funcion encuntro y asigno lo que encontre a una variable
	/*Usuario.findById( parametro, (err, usuarioDB) => {
		usuarioDB.save();
	} );*/

	//enviar en formato html->send, formato json->json
	/*resuesta.json({
		id:parametro,
		path:"put"
	});*/
});

//peticion DELETE - Borrar registro - localhost:3000/usuario
//:id -> parametro a recibir
app.delete('/usuario/:id', function (request, resuesta) {
	//enviar en formato html->send, formato json->json
	//resuesta.json('delete usuario');

	let id = request.params.id;
	/* Funcion para borrar fisicamente un usuario
	Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
		if(err){
			//mandar status de respuesta, 400: bad request
			return resuesta.status(400).json({
				ok:false,
				err
			});
		}

		if(!usuarioBorrado){
			return resuesta.status(400).json({
				ok:false,
				err: {
					message: "Usuario no encontrado"
				}
			});
		}
		resuesta.json({
			ok:true,
			usuario: usuarioBorrado
		});
	});*/

	let cambiaEstado = {
		estado:false
	};
	//new:true -> me devuelve el usuario actualizado
	//puedo quitar cambiarEstado y poner directo {estado:false}
	Usuario.findByIdAndUpdate( id, cambiaEstado, {new:true}, (err, usuarioBorrado) => {

		if(err){
			//mandar status de respuesta, 400: bad request
			return resuesta.status(400).json({
				ok:false,
				err
			});
		}

		resuesta.json({
			ok:true,
			usuario: usuarioBorrado
		});
		
	} );

});

module.exports = app;