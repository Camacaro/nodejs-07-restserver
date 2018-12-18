
const jwt = require('jsonwebtoken');

// ==========
// Verificar Token
// req: solicitud
// res: respuesta
// next: continuar con la ejecucion del programa
// ==========
let verificaToken = ( req, res, next) => {

	// ==========
	// con la funcion get puedo obtener los headers
	// ==========
	let token = req.get('token');

	// ==========
	// jwt.verify - Parametros
	// token: data
	// SEED: la clave a enviar
	// err: si sucede algun error
	// decoded: informacion decodificada, es el payload 
	// ==========
	jwt.verify( token, process.env.SEED, (err, decoded)=>{
		
		if(err){
			return res.status(401).json({
				ok:false,
				err: {
					message: 'Token no válido'
				}
			});
		}

		// ==========
		// Creo una nueva propiedad en la request llamada usuario
		// ==========
		req.usuario = decoded.usuario;
		next();
	});
};

// ==========
// Verifica AdminRole
// ==========
let verificaAdmin_Role = ( req, res, next) => {

	// ==========
	// Ya la variable usuario se encuentra en los request
	// ==========
	let usuario = req.usuario;

	let rol = usuario.role;

	if( rol === "ADMIN_ROLE"){
		next();
	}else{
		return res.json({
			ok:false,
			err:{
				message: 'El usuario no es administrador'
			}
		});
	}
	
};

module.exports = {
	verificaToken,
	verificaAdmin_Role
}