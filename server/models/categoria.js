const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

let categoriaSchema = new Schema({
	descripcion: {
		type: String,
		unique: true,
		required: [true, 'La descripción es obligatoria']
	},
	usuario: {
		type: Schema.Types.ObjectId, 
		ref: 'Usuario'
	}
});
// ==============
// Primer parametro es la identidad, nombre como tal que se guardara en la db es como si fuera la tabla
// mongoose lo que hace es que en la base de datos 'Project' lo convertira en miniscula y lo pluralisa 'projects
// =====================
module.exports = mongoose.model('Categoria', categoriaSchema);