const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: "040-123456"
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: "12-43-234345"
    },
    {
        id: 4,
        name: 'Mary Poppendick',
        number: "39-23-6423122"
    }
]

const generateRandomId = (max) => {
    let id = Math.round(Math.random() * max)
    let person = persons.find(person => person.id === id)
    if (person) {
        generateRandomId(100)
    } else {
        return id
    }
}
morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] :response-time :body'))

app.get('/api/persons',(request,response) => {
    response.json(persons)
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
    let id = Number(request.params.id)
    let person = persons.find( person => person.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
    
})

app.delete('/api/persons/:id',(request, response) => {
    let id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons',(request, response) => {
    let body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'The name and number are required'
        })
    }

    let personMatch = persons.find(person => person.name === body.name)

    if (personMatch) {
        return response.status(406).json({
            error: 'The name must be unique'
        })        
    }

    let person = {
        id: generateRandomId(100),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

