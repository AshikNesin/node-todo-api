const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: `{VALUE} is not a valid email`
        }
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.toJSON = function(){
	const user = this;
	var userObject = user.toObject()
	return _.pick(userObject,['_id','email'])
}


UserSchema.methods.generateAuthToken = function(){
	// Arrow fn do not bind this keyword that's why we are using regular function
	const user = this;
	const access = 'auth';
	const token = jwt.sign({_id:user._id.toHexString(),access},'qwerty').toString()
	user.tokens.push({
		access,
		token
	})

	return user.save().then(()=>{
		return token
	})
}

UserSchema.statics.findByToken = function(token){
	const User = this; // User Model
	let decoded;
	try{
		decoded=jwt.verify(token,'qwerty')
	} catch(e){
		// return new Promise((resolve,reject)=>{
		// 	reject(e)
		// })
		return Promise.reject()
	}
	return User.findOne({
		_id:decoded._id,
		'tokens.access':token,
		'tokens.access':'auth',
	})
}

const User = mongoose.model('User', UserSchema)
module.exports = { User };
