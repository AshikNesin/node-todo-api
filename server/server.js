const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const _ = require('lodash')
const { ObjectId } = require('mongodb')
const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const {authenticate} = require('./middleware/authenticate')
const PORT = process.env.PORT || 3000
app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.send({ msg: "It works!" })
})
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos })
    }, (err) => {
        res.send(400).send(err)
    })
})
app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    })
    todo.save().then((doc) => {
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

app.get('/todos/:id', (req, res) => {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
        return res.status(404).send({ error: 'Invalid Id' })
    }
    Todo.findById(id).then((item) => {
            if (!item) {
                return res.status(404).send({ error: 'Item not found' })
            }
            res.send({ todo: item })
        })
        .catch((err) => {
            res.status(400).send()
        })
})
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
        return res.status(404).send({ error: 'Invalid Id' })
    }
    Todo.findByIdAndRemove(id).then((item) => {
            if (!item) {
                return res.status(404).send({ error: 'Item not found' })
            }
            res.send({ todo: item })
        })
        .catch((err) => {
            res.status(400).send()
        })
})

app.patch('/todos/:id', (req, res) => {
    const id = req.params.id
    const body = _.pick(req.body, ['text', 'completed'])
    if (!ObjectId.isValid(id)) {
        return res.status(404).send({ error: 'Invalid Id' })
    }
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime()
    } else {
        body.completed = false
        body.completedAt = null
    }

    Todo.findOneAndUpdate({ _id: id }, { $set: body }, { new: true })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send({ error: 'Item not found' })
            }
            res.send({ todo })
        })
        .catch((e) => {
            res.status(400).send(e)
        })
})

app.post('/users',(req,res)=>{
    const body = _.pick(req.body,['email','password'])
    const user = new User(body)
    user.save().then((user)=>{
        return user.generateAuthToken()
        // res.send(user)
    })
    .then((token)=>{
        res.header('x-auth',token).send(user)
    })
    .catch((err)=>{
        res.status(400).send(err)
    })
})

app.get('/users/me',authenticate,(req,res)=>{
    res.send(req.user)
})

app.listen(PORT, () => {
    console.log(`Todo API running on PORT ${PORT}`);
})

module.exports = { app };
