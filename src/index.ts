import express, { Request, Response, NextFunction } from 'express'
import { BaseError } from './util/error'
import { sendData } from './util/sendData'
const { readFile } = require('fs/promises')

export const app = express()
const port = 3000
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.listen(port, () => console.log(`Listening on ${port}`))

app.post('/analyze', (req, res) => {
    let inputData = req.body
    let userData = sendData(inputData)
    res.json({
        statusCode: 200,
        data: userData,
    })
})

app.get('/YourCard.png', async function (req, res) {
    try {
        res.sendFile('YourCard.png', { root: '.' })
    } catch (error) {
        const cardError = new BaseError(400, 'Card not found. Did you run a POST request first?')
        throw cardError
    }
})
