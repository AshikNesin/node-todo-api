const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const {ObjectId} = require('mongodb')
const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')
const PORT = process.env.PORT || 3000
app.use(bodyParser.json())
app.get('/',(req,res)=>{
	res.send({msg:"It works!"})
})
app.get('/todos',(req,res)=>{
	Todo.find().then((todos)=>{
		res.send({todos})
	},(err)=>{
		res.send(400).send(err)
	})
})
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

app.get('/todos/:id',(req,res)=>{
	const id = req.params.id
	if(!ObjectId.isValid(id)){
		return res.status(404).send({error:'Invalid Id'})
	}
	Todo.findById(id).then((item)=>{
		if(!item){
			return res.status(404).send({error:'Item not found'})
		}
		res.send({todo:item})
	})
	.catch((err)=>{
		res.status(400).send()
	})
})
app.delete('/todos/:id',(req,res)=>{
	const id = req.params.id
	if(!ObjectId.isValid(id)){
		return res.status(404).send({error:'Invalid Id'})
	}
	Todo.findByIdAndRemove(id).then((item)=>{
		if(!item){
			return res.status(404).send({error:'Item not found'})
		}
		res.send({todo:item})
	})
	.catch((err)=>{
		res.status(400).send()
	})
})
app.listen(PORT,()=>{
	console.log(`Todo API running on PORT ${PORT}`);
})

module.exports = {app};