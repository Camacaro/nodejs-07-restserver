const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/Categoria');

// =============================
// Mostrar todas las categorias
// =============================
app.get('/categoria', verificaToken, (req, res) =>{

	// =============================
	// Popule sirve para relacionar campos que tienen un id relacional
	// .populate('usuario') -> trae todos los campos
	// sort() -> ordene 
	// =============================
	Categoria.find( {}, 'descripcion usuario' )
		.sort('descripcion')
		.populate('usuario', 'nombre email')
		.exec( (err, categorias)=>{
			if(err){
				//mandar status de respuesta, 400: bad request
				return res.status(400).json({
					ok:false,
					err
				});
			}

			Categoria.count({}, (err, conteo)=>{
				res.json({
					ok:true,
					categorias,
					cuantos: conteo
				});
			});

			
		})
});

// =============================
// Mostrar una categoria por ID
// =============================
app.get('/categoria/:id', verificaToken, (req, res) =>{

	let id = req.params.id;

	Categoria.findById( id, (err, categoriaDB) => {

		if(err){
			//mandar status de respuesta, 400: bad request
			return res.status(400).json({
				ok:false,
				err
			});
		}

		// =============================
		// Si no se guarda
		// =============================
		if(!categoriaDB){
			return res.status(500).json({
				ok:false, 
				err: {
					message: 'El id no es validado'
				}
			});
		}

		res.json({
			ok:true,
			categoriaDB
		});
		
	} );
});

// =============================
// Crear nueva categoria 
// =============================
app.post('/categoria', verificaToken, (req, res) =>{

	let body = req.body;

	let categoria = new Categoria({
		descripcion : 	body.descripcion,
		usuario 	: 	req.usuario._id
	});

	categoria.save( (err, categoriaDB) => {
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
		if(!categoriaDB){
			return res.status(500).json({
				ok:false, 
				err
			});
		}

		res.json({
			ok:true,
			categoria: categoriaDB
		});
	} );
});

// =============================
// Actualizar categoria 
// =============================
app.put('/categoria/:id', verificaToken, (req, res) =>{
	//regresa la nueva categoria

	let idCategoria = req.params.id;
	let body 		= req.body;

	Categoria.findByIdAndUpdate( idCategoria, body, 
		{new:true, runValidators:true}, 
		(err, categoriaDB) => {

		if(err){
			//mandar status de respuesta, 400: bad request
			return resp.status(400).json({
				ok:false,
				err
			});
		}

		// =============================
		// Si no se actualiza
		// =============================
		if(!categoriaDB){
			return res.status(500).json({
				ok:false, 
				err
			});
		}

		res.json({
			ok:true,
			categoria: categoriaDB
		});
		
	} );

});

// =============================
// Borrar categoria 
// =============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) =>{
	//solo un administrador pude borrar categorias
	//Categoria.findByIdAndRemove

	let idCategoria = req.params.id;

	Categoria.findByIdAndRemove( idCategoria, 
		(err, categoriaDB) => {

		if(err){
			//mandar status de respuesta, 400: bad request
			return resp.status(400).json({
				ok:false,
				err
			});
		}

		// =============================
		// Si no se elimina
		// =============================
		if(!categoriaDB){
			return res.status(500).json({
				ok:false, 
				err: {
					message: 'El id no existe'
				}
			});
		}

		res.json({
			ok:true,
			categoria: categoriaDB,
			message: 'Categoria Borrada'
		});
		
	} );
});

module.exports = app;
