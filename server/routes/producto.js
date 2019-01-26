const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

const _ = require('underscore');

// =============================
// Obtener Todos los productos
// =============================
app.get('/productos', verificaToken, (req, res) => {
	// =============================
	// Traer todos los productos
	// usando popules -> Usuario categoria
	// paginado
	// =============================

	let desde = req.query.desde || 0;
	desde = Number(desde);

	let limite = req.query.limite || 5;
	limite = Number(limite);

	Producto.find( {disponible:true}, 
			'nombre precioUni descripcion categoria usuario' )
		.populate('usuario', 'nombre email')
		.populate('categoria', 'descripcion')
		.skip( desde )
		.limit( limite )
		.exec( (err, productos)=>{
			
			if(err){
				//mandar status de respuesta, 400: bad request
				return res.status(400).json({
					ok:false,
					err
				});
			}

			Producto.count({disponible:true}, (err, conteo)=>{
				res.json({
					ok:true,
					productos,
					cuantos: conteo
				});
			});

			
		})
}); 

// =============================
// Obtener un productos por ID
// =============================
app.get('/productos/:id', verificaToken, (req, res) => {
	// =============================
	// Usando popules Usuario y categoria
	// =============================

	let id = req.params.id;

	Producto.findById( id, 
			'nombre precioUni descripcion categoria usuario' )
		.populate('usuario', 'nombre email')
		.populate('categoria', 'descripcion')
		.exec( (err, productoDB)=>{

			if(err){
				//mandar status de respuesta, 400: bad request
				return res.status(500).json({
					ok:false,
					err
				});
			}

			// =============================
			// Si no se guarda
			// =============================
			if(!productoDB){
				return res.status(400).json({
					ok:false, 
					err: {
						message: 'El id no es validado'
					}
				});
			}

			res.json({
				ok:true,
				productoDB
			});
		});
});

// =============================
// Buscar Producto
// =============================
app.get('/productos/buscar/:termino', verificaToken, (req, res)=>{

	let termino = req.params.termino;
	termino = String(termino);

	// =============================
	// Exprecion regular
	// new RegExp(palabra, 'insencible a mayuscula y minuscula' ) expresion regular de javascript
	// =============================
	let regex = new RegExp(termino, 'i');


	Producto.find({nombre:regex})
			.populate('categoria', 'nombre')
			.exec( (err, productos)=>{

				if(err){
					//mandar status de respuesta, 400: bad request
					return res.status(500).json({
						ok:false, 
						err
					});
				}

				res.json({
					ok:true,
					productos
				});
			} )
});

// =============================
// Crear un nuevo producto
// =============================
app.post('/productos', verificaToken, (req, res) => {
	// =============================
	// grabar un usuario
	// grabar una categoria del listado	
	// =============================

	let body = req.body;

	let producto = new Producto({

		nombre		: body.nombre,
		precioUni	: body.precioUni,
		descripcion	: body.descripcion,
		categoria	: body.categoria,
		usuario		: req.usuario._id

	});

	producto.save( (err, productoDB) => {
		
		if(err){
			
			return res.status(500).json({
				ok:false, 
				err
			});
		}

		// =============================
		// Si no se guarda
		// =============================
		if(!productoDB){
			return res.status(500).json({
				ok:false, 
				err
			});
		}

		res.json({
			ok:true,
			producto: productoDB
		});
	} );
});

// =============================
// actualizar un producto
// =============================
app.put('/productos/:id', verificaToken, (req, res) => {

	let idProducto  = req.params.id;
	let body = _.pick( req.body, [ 'nombre', 'precioUni', 'descripcion', 'categoria', 'usuario', ] );

	Producto.findByIdAndUpdate( idProducto, body, 
		{new:true, runValidators:true}, 
		(err, productoDB) => {

		if(err){
			//mandar status de respuesta, 400: bad request
			return res.status(400).json({
				ok:false,
				err
			});
		}

		// =============================
		// Si no se actualiza
		// =============================
		if(!productoDB){
			return res.status(500).json({
				ok:false, 
				err : {
					message: "El ID no existe"
				}
			});
		}

		res.json({
			ok:true,
			producto: productoDB
		});
		
	} );
});

// =============================
// Borrar un productos por ID
// =============================
app.delete('/productos/:id', verificaToken, (req, resp) => {
	// =============================
	// cambiar el estado de disponible
	// =============================

	let id = req.params.id;

	let cambiaEstado = {
		disponible:false
	};

	Producto.findByIdAndUpdate( id, cambiaEstado, {new:true}, (err, productoBorrado) => {

		if(err){
			//mandar status de respuesta, 400: bad request
			return resp.status(400).json({
				ok:false,
				err
			});
		}

		resp.json({
			ok:true,
			producto: productoBorrado,
			mensaje: 'Producto Borrado'
			
		});
		
	} );


});

module.exports = app;