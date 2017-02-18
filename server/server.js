const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')

app.use(bodyParser.json())

app.post('/todos',(req,res)=>{
	const todo = new Todo({
		text:req.body.text
	})
	todo.save().then((doc)=>{
		res.send(doc)
	},(err)=>{
		res.status(400).send(err)
	})
})
app.listen(3000,()=>{
	console.log('Todo API running on PORT 3000');
})

module.exports = {app};