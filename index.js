require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.static(path.resolve(__dirname, './build')));
app.use(express.json())

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] :response-time :body'))

app.get('/api/persons',(request,response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info',(request,response) => {
    response.send(
        `
            <p>Phonebook has info for ${persons.length} people</p>
            <br>
            ${new Date}
        `
    )
})

app.get('/api/persons/:id',(request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id',(request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(person => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons',(request, response, next) => {
    let body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))

})

app.put('/api/persons/:id',(request, response, next) => {
    let body = request.body
    if (!body.number) {
        return response.status(400).json({
            error: 'The number are required'
        })
    }
    Person.findByIdAndUpdate({_id: request.params.id}, {number: body.number },{ runValidators: true, new: true})
    .then(updatedPerson =>{
        return response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.get('*', (request, response)  => {
    response.sendFile(path.resolve(__dirname, './build', 'index.html'));
});

// Error Middlewares

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        if (/(to be unique)/.test(error.message)) {
            return response.status(406).json({ error: error.message })
        }
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

