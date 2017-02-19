const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')
const { app } = require('./../server')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/user')
const { todos, populateTodos, users, populateUsers } = require('./seeds/seeds')

beforeEach(populateUsers)

beforeEach(populateTodos)

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Test Todo text'
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1)
                    expect(todos[0].text).toBe(text)
                    done()
                }).catch((e) => done(e))
            })
    });

    it('should not create a new todo with invalid body data', (done) => {
        const text = ''
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return err
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2)
                    done()
                }).catch((e) => done(e))
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1)
            })
            .end(done)
    });
});

describe('GET /todos/:id', () => {
    it('should return a todo doc', (done) => {

        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done)
    });

    it('should not return a todo doc created by another user', (done) => {

        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
    it('should return 404 if doc not found', (done) => {
        const hexId = ObjectId().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })


    it('should return 404 for non-object Id', (done) => {
        request(app)
            .get(`/todos/1234`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
});

describe('DELETE /todos/:id', (done) => {
    it('should remove a todo', (done) => {
        const hexId = todos[0]._id.toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist()
                    done()
                }).catch((e) => done(todo))
            })
    });

    it('should not remove a todo created by other user', (done) => {
        const hexId = todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist()
                    done()
                }).catch((e) => done(e))
            })
    });
    it('should return 404 if doc not found', (done) => {
        const hexId = ObjectId().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-object Id', (done) => {
        request(app)
            .delete(`/todos/1234`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should return updated docs and status 200', (done) => {
        const updatedText = 'First Todo is an updated todo'
        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({ text: updatedText, completed: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(updatedText)
                expect(res.body.todo.completed).toBe(true)
                expect(res.body.todo.completedAt).toBeA('number')
            })
            .end(done)
    });

    it('should not updated doc created by other user', (done) => {
        const updatedText = 'First Todo is an updated todo'
        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({ text: updatedText, completed: true })
            .expect(404)
            .end(done)
    });

    it('should return 404 if doc not found', (done) => {
        const hexId = ObjectId().toHexString();
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-object Id', (done) => {
        request(app)
            .patch(`/todos/1234`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString())
                expect(res.body.email).toBe(users[0].email)
            })
            .end(done)

    })

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .end(done)
    })
})

describe('POST /users', () => {
    it('should create a user', (done) => {
        const payload = {
            email: 'ashiknesin@gmail.com',
            password: 'nesin1994'
        }
        request(app)
            .post('/users/')
            .send(payload)
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist()
                expect(res.body._id).toExist()
                expect(res.body.email).toBe(payload.email)
            })
            .end((err) => {
                if (err) {
                    return done(err)
                }

                User.findOne({ email: payload.email }).then((user) => {
                    expect(user).toExist()
                    expect(user.password).toNotBe(payload.password)
                    done()
                })
            })
    })

    it('should not create if email exists', (done) => {
        const payload = {
            email: 'userone@example.com',
            password: 'password123'
        }
        request(app)
            .post('/users/')
            .send(payload)
            .expect(400)
            .end(done)
    })

    it('should return validation error if request is invalid', (done) => {
        const payload = {
            email: 'validuser',
            password: 'pass'
        }
        request(app)
            .post('/users/')
            .send(payload)
            .expect(400)
            .end(done)
    })
})

describe('POST /users/login', () => {
    it('should login user and return token', (done) => {
        const { email, password } = users[1]
        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist()
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    })
                    done();
                }).catch((e) => done(e))
            })
    })
    it('should return 400 for invalid credentails', (done) => {
        const payload = {
            email: 'userone@example.com',
            password: 'password1235'
        }
        request(app)
            .post('/users/login')
            .send(payload)
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist()
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1)
                    done();
                }).catch((e) => done(e))
            })

    })

})

describe('DELETE /users/me/token', () => {
    it('should delete token in db and return 200', (done) => {
        request(app)
            .delete('/users/me/token')
            .expect(200)
            .set('x-auth', users[0].tokens[0].token)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0)
                    done();
                }).catch((e) => done(e))
            })
    })

    it('should return 401 if Unauthorized', (done) => {
        request(app)
            .delete('/users/me/token')
            .expect(200)
            .set('x-auth', users[0].tokens[0].token)
            .end(done)
    })
})
