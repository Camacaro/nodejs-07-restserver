
const mongoose 	= require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

/*variable para enun, el VALUE sera el valor que mande el usuario*/
let rolesValidos = {
	values: ['ADMIN_ROLE', 'USER_ROLE'],
	message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;
/*Parametros de Creacion de una base de datos*/
let usuarioSchema = new Schema({
	nombre: {
		type: String,
		required: [true, 'Nombre es necesario']
	},
	email: {
		type: String,
		unique: true,
		required: [true, 'Correo es necesario']
	},
	password: {
		type: String,
		required: [true, 'La contraseña es necesario']	
	},
	img:{
		type: String,
		required: false
	},
	role: {
		type: String,
		default: 'USER_ROLE',
		enum: rolesValidos	
	},
	estado:{
		type: Boolean,
		default: true	
	},
	google:{
		type: Boolean,
		default: false
	}
});

/*Modificar la impresion en json del schema, quitando la password*/
usuarioSchema.methods.toJSON = function () {
	//copio el schema
	let user = this;
	//clono el schema
	let userObjects = user.toObject();
	//borro el objeto a imprimir
	delete userObjects.password;
	//devulvo el objeto a imprimir
	return userObjects;
}

/*plugin para validar un campo unico, el PATH es el campo a insertar*/
usuarioSchema.plugin( uniqueValidator, {message:'{PATH} debe de ser unico'}) ;

/*Creacion de una base de datos*/
module.exports = mongoose.model( 'Usuario', usuarioSchema );