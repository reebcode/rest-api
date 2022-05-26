import pokemons = require('../dbs/pokedex.json')
import paragraphs = require('../dbs/paragraphs.json')
import { CanvasRenderingContext2D, loadImage } from 'canvas'
import fs from 'fs'
import { StatusError } from './error'
const { readFile } = require('fs/promises')

/**
 * Takes, in a JSON object, processes it, and returns a JSON object with a string, a paragraph, and a link to an image.
 * @param {any} data - The data that is passed in from the API.
 * @returns an object with the following properties:
 * mixedName: The mixed name of the user and their favorite pokemon.
 * para: The paragraph that is generated based on the user's name and favorite pokemon.
 * img: The path to the image that is generated based on the user's name and favorite pokemon.
 */
export function processData(data: any) {
    data = JSON.stringify(data)
    //Check for dash (proper input)
    if (data.indexOf('-') == -1) {
        const inputError = new StatusError(400, 'Dash not found, an example input is {"data": "john-Bulbasaur"}')
        throw inputError
    }
    //Find dash index
    let dashPoint = 0
    for (let i = 0; i < data.length; i++) {
        if (data.charAt(i) == '-') {
            dashPoint = i
            break
        }
    }

    //Variables
    let firstName: string = ''
    let favPoke: string = ''
    let mixedName: string = ''

    /* Setting the first name, favorite pokemon, and mixed name. Input validity error check present*/
    try {
        //set firstname
        firstName = data.substr(9, dashPoint - 9).toLowerCase()
        firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1, firstName.length)
        //set favpoke
        favPoke = data.substr(dashPoint + 1, data.indexOf('}') - dashPoint - 2).toLowerCase()
        favPoke = favPoke.substring(0, 1).toUpperCase() + favPoke.substring(1, favPoke.length)
        //set mixedname
        mixedName = ''
        if (firstName.length > 7) {
            mixedName += firstName.substring(0, firstName.length / 2)
        } else if (firstName.length > 2) {
            mixedName += firstName.substring(0, 3)
        } else {
            mixedName += firstName.substring(0, firstName.length)
        }
        if (favPoke.length > 6) {
            mixedName += favPoke.substring(favPoke.length / 2, favPoke.length)
        } else {
            mixedName += favPoke.substring(favPoke.length - 3, favPoke.length)
        }
    } catch (e) {
        const inputError = new StatusError(400, 'Input is not valid. May not be a string or is incomplete. Example input: {"data": "john-Bulbasaur"}')
        throw inputError
    }

    /**
     * Checking if the pokemon exists in the pokedex.json file, save json to poke if true.
     * Then get type and save type to @param { string } pokeType - Pokemon type, used to get paragraph
     * Get and save pokemon number to @param { number } pokeNum - Pokemon number, used to get stats later
     */
    let poke = pokemons.find((poke) => poke.name.english === favPoke)
    //Check Validity of Pokemon
    if (poke == undefined) {
        const pokeError = new StatusError(400, 'Favpoke undefined, perhaps the inputted pokemon does not exist?')
        throw pokeError
    }
    let pokeNum
    let pokeType
    //Get type and pokemon number
    if (poke) {
        pokeType = poke.type[0].toLowerCase()
        pokeNum = poke.id
    }

    /**
     * Checking if the letter (first letter of first name) exists in the paragraphs.json file.
     * If true saves to @param { string } namePara - Name Paragraph
     */
    let letter = firstName.substring(0, 1)
    type Key = keyof typeof paragraphs.letters
    let keyVal = letter as Key
    let namePara = paragraphs.letters[keyVal]
    if (namePara == undefined) {
        const nameError = new StatusError(400, 'nameError, inputted name is likely not valid.')
        throw nameError
    }

    /**
     * Checking if pokeType - found above, exists in the paragraphs.json file.
     * If true saves to @param { string } pokePara - Poke Paragraph
     */
    type pokeKey = keyof typeof paragraphs.types
    let pokeKeyVal = pokeType as pokeKey
    let pokePara = paragraphs.types[pokeKeyVal]

    //Mix together name, name para next, then the trait paragraph (pokepara)
    let para = mixedName + ', ' + namePara + ' ' + pokePara

    //Pokemon stats for image
    let vary = firstName.length
    let stats: string[] = [
        'Health: ' + (poke!.base.HP + vary).toString(),
        'Attack: ' + (poke!.base.Attack + vary).toString(),
        'Defense: ' + (poke!.base.Defense + vary).toString(),
        'Speed: ' + (poke!.base.Speed + vary).toString(),
    ]

    //Create image && store buffer
    if (pokeNum && pokeType) {
        createCard(pokeNum, pokeType, mixedName, firstName, namePara, pokePara, stats)
    }

    //Send data to API
    return {
        mixedName: mixedName,
        para: para,
        img: './YourCard.png',
    }
}

/**
 * Takes the pokemon number, type, the mixed name, first name, name paragraph, pokeparagraph, and an array of stats, and
 * then it creates a card with the given information.
 * @param {number} pokeNum - number, pokeType: string, mixed: string, firstName: string, namePara:
 * string, pokePara: string, stats: string[]
 * @param {string} pokeType - string, mixed: string, firstName: string, namePara: string, pokePara:
 * string, stats: string[]
 * @param {string} mixed - string, firstName: string, namePara: string, pokePara: string, stats:
 * string[]
 * @param {string} firstName - string, namePara: string, pokePara: string, stats: string[]
 * @param {string} namePara - string, pokePara: string, stats: string[]
 * @param {string} pokePara - string, stats: string[], pokeType: string, pokeNum: number, mixed:
 * string, firstName: string, namePara: string
 * @param {string[]} stats - string[] = ['HP: ' + hp, 'Attack: ' + attack, 'Defense: ' + defense, 'Sp.
 * Atk: ' + spAtk, 'Sp. Def: ' + spDef, 'Speed: ' + speed]
 */

async function createCard(pokeNum: number, pokeType: string, mixed: string, firstName: string, namePara: string, pokePara: string, stats: string[]) {
    try {
        const Canvas = require('canvas')
        let canvas: {
            getContext: (arg0: string) => CanvasRenderingContext2D
            width: number
            height: number
            toBuffer: () => any
        }
        //setup canvas
        canvas = Canvas.createCanvas(747, 1038)
        const ctx = canvas.getContext('2d')
        //set font variables
        ctx.font = '30px Arial'
        ctx.fillStyle = '#000000'

        //Draw Card BG
        const backgroundFile = await readFile('./src/dbs/imgs/' + pokeType + '.png')
        const background = await Canvas.loadImage(backgroundFile)
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        //Draw pokemon
        let pokeImg = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + pokeNum + '.png'
        const pokeImage = await Canvas.loadImage(pokeImg)
        ctx.drawImage(pokeImage, 130, 70, 460, 460)
        //Draw Name Text
        ctx.fillText(mixed, 150, 73)
        //Draw description text.
        ctx.font = '18px Arial'
        ctx.fillText(mixed + ', ' + namePara, 65, 555)
        ctx.fillText(pokePara, 65, 575)
        let startIndex = 605
        for (let i = 0; i < stats.length; i++) {
            ctx.fillText(stats[i], 65, startIndex)
            startIndex += 20
        }
        //Draw final line
        ctx.fillText('Some say it bears a striking resemblance to ' + firstName + '.', 65, startIndex + 195)
        //Write canvas to file
        const buffer = canvas.toBuffer()
        fs.writeFileSync('./YourCard.png', buffer)
    } catch (e) {
        const nameError = new StatusError(400, 'nameError, inputted name is likely not valid.')
        throw nameError
    }
}
