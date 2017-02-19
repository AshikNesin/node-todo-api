const { ObjectId } = require('mongodb')
const { Todo } = require('./../../models/todo')
const { User } = require('./../../models/user')
const jwt = require('jsonwebtoken')

const todos = [{
    _id: ObjectId(),
    text: 'First todo item'
}, {
    _id: ObjectId(),
    text: 'Seconde todo item'
}]

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done())
}

const userOneId = new ObjectId()
const userTwoId = new ObjectId()

const users = [{
    _id: userOneId,
    email: "userone@example.com",
    password: "password1",
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, 'qwerty').toString()
    }]
}, {
    _id: userTwoId,
    email: "usertwo@example.com",
    password: "password2"
}, ]

const populateUsers = (done) => {
    User.remove({}).then(() => {
    	// insertMany does not work with middleware so we have to insert them individually
		const userOne = new User(users[0]).save()
		const userTwo = new User(users[1]).save()
		return Promise.all([userOne,userTwo])
        return Todo.insertMany(todos)
    }).then(() => done())
}

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
};
