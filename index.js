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

app.get('/api/persons/:id',(request,response) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
    
})

app.delete('/api/persons/:id',(request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(person => {
            response.status(204).end()
        })
})

app.post('/api/persons',(request, response) => {
    let body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'The name and number are required'
        })
    }

    Person.findOne({name: body.name},(err, res) => {
        if (err) {
            return response.status(500).json({
                error: 'Error saving to database'
            })
        }

        if (res) {
            return response.status(406).json({
                error: 'The name must be unique'
            }) 
        }

        const person = new Person({
            name: body.name,
            number: body.number
        })

        person.save().then(savedPerson => {
            response.json(savedPerson)
        })
    })
})

app.get('*', (request, response)  => {
    response.sendFile(path.resolve(__dirname, './build', 'index.html'));
  });

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

