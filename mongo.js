const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

if (process.argv.length > 5) {
    console.log('Invalid params: node mongo.js <password> <name> <phonenumber>')
    process.exit(1)
  }

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]


const url =
  `mongodb+srv://david:${password}@cluster0.qcyfunn.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (name === undefined && number === undefined) {
    Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach((person) => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      })
} else if (name && number) {
    const person = new Person({
        name: name,
        number: number
      })
      
      person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
      })
} else {
    console.log('Invalid params')
    mongoose.connection.close()
}

