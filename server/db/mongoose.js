const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const MONGODB_URI = {
	dev:'mongodb://localhost:27017/node-todo',
	test:'mongodb://localhost:27017/node-todo-test',
	production:process.env.MONGODB_URI
}
mongoose.connect(MONGODB_URI[process.env.NODE_ENV])
console.log(MONGODB_URI[process.env.NODE_ENV]);
module.exports = {mongoose}