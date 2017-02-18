const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')
const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const todos = [{
    _id: ObjectId(),
    text: 'First todo item'
}, {
    _id: ObjectId(),
    text: 'Seconde todo item'
}]
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done())
})

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Test Todo text'
        request(app)
            .post('/todos')
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
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2)
            })
            .end(done)
    });
});

describe('GET /todos/:id', () => {
    it('should return a todo doc', (done) => {

        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done)
    });

    it('should return 404 if doc not found', (done) => {
        const hexId = ObjectId().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-object Id', (done) => {
        request(app)
            .get(`/todos/1234`)
            .expect(404)
            .end(done)
    })
});

describe('DELETE /todos/:id', (done) => {
    it('should return return deleted doc with status 200', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done)
    });
    it('should return 404 if doc not found', (done) => {
        const hexId = ObjectId().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done)
    })

    it('should return 404 for non-object Id', (done) => {
        request(app)
            .delete(`/todos/1234`)
            .expect(404)
            .end(done)
    })
})
