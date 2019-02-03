const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// ============================
// FileSystem
// ============================
const fs = require('fs');
// ============================
// Construir rutas
// ============================
const path = require('path');

// ============================
// default options, middleware 
// funciona para que todo archivo que se suba quede almacenado en
// en una variable llamada files, require.file
// ============================
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

	let tipo = req.params.tipo;

	let id = req.params.id;

	/*if (Object.keys(req.files).length == 0) {

	    return res.status(400).json({
			ok: false,
			err: {
				message: 'No se ha seleccionado ningun archivo'
			}
		});	
	}*/

	if(!req.files){
		return res.status(400).json({
			ok: false,
			err: {
				message: 'No se ha seleccionado ningun archivo'
			}
		});
	}

	// ============================
	// Validar tipos de parametro
	// ============================
	let tiposValido = ['productos', 'usuarios'];

	if( tiposValido.indexOf( tipo ) < 0){

		return res.status(400).json({
			ok: false,
			err: {
				message: 'Los tipos permitido son ' + tiposValido.join(', '),
			}
		});	
	}


	// ============================
	// archivo, nombre que viene del input
	// ============================
  	let archivo = req.files.archivo;

  	// ============================
	// Extensiones permitidas
	// ============================
	let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	let nombreCortado = archivo.name.split('.');
	//para obtener la ultima posicion
	let extension = nombreCortado[ nombreCortado.length - 1];
	//para buscar en el arrglo
	if( extensionesValidas.indexOf( extension)  < 0){
		return res.status(400).json({
			ok:false,
			err: {
				message: 'Las extensiones permitida son ' + extensionesValidas.join(', '),
				ext: extension

			}
		});
	}


	// ============================
	// Cambiar el nombre al archivo
	// 18897asdf-123.png
	// ============================
	let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`;


  	// ============================
	// guardar archivo a esta ruta
	// archivo.name -> nombreArchivo
	// ============================
  	archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    	
    	if (err){
    		return res.status(500).json({
    			ok: false,
    			err
    		});
    	}	

    	// ============================
		// imagen, cargada
		// ============================      
		if(tipo === 'usuarios'){
			imgenUsuario(id, res, nombreArchivo);
		}else{
			imagenProducto(id, res, nombreArchivo);
		}
		

	    /*res.json({
	    	ok:true,
	    	message: 'Imagen subida correctamente'
	    });*/
	});


});

function imgenUsuario(id, res, nombreArchivo) {
	
	Usuario.findById( id, (err, usuarioDB) => {
		
		if(err){

			// ============================
			// Si ocurre un error hay que borrar la imagen que se subio
			// ============================
			borraArchivo( nombreArchivo, 'usuarios' );

			return res.status(500).json({
				ok: false,
				err
			});
		}

		if(!usuarioDB){

			borraArchivo( nombreArchivo, 'usuarios' );

			return res.status(400).json({
				ok: false,
				err: {
					message: 'El Usuario no existe'
				}
			});
		}

		borraArchivo( usuarioDB.img, 'usuarios' );

		usuarioDB.img = nombreArchivo;

		usuarioDB.save( (err, usuarioGuardado) => {
			res.json({
				ok: true,
				usuario: usuarioGuardado,
				img: nombreArchivo
			});
		});



	});
}

function imagenProducto(id, res, nombreArchivo) {
	
	Producto.findById( id, (err, productoDB) => {

		if(err){

			// ============================
			// Si ocurre un error hay que borrar la imagen que se subio
			// ============================
			borraArchivo( nombreArchivo, 'productos' );

			return res.status(500).json({
				ok: false,
				err
			});
		}

		if(!productoDB){

			borraArchivo( nombreArchivo, 'productos' );

			return res.status(400).json({
				ok: false,
				err: {
					message: 'El Producto no existe'
				}
			});
		}

		borraArchivo( productoDB.img, 'productos' );

		productoDB.img = nombreArchivo;

		productoDB.save( (err, productoGuardado) => {
			res.json({
				ok: true,
				producto: productoGuardado,
				img: nombreArchivo
			});
		});

	});
}

function borraArchivo(nombreImagen, tipo) {
	
	let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
	
	// ============================
	// verificar si existe el archivo
	// true si existe, false sino
	// ============================
	if( fs.existsSync( pathImagen ) ){
		// ============================
		// Borrar archivo
		// ============================
		fs.unlinkSync( pathImagen );
	}
}

module.exports = app;