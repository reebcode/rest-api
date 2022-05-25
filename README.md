# Pokemon Name Analysis Rest API

### Intro

This rest API takes in the inputs of a first name and a favorite of the first 151 pokemon, and returns a JSON response with a combination of their name and the pokemons name, a paragraph of name analysis based on the first name, pokemon, and pokemon type, and creates an image with said information, which also has some stats based on each name.

### Setup and Important Commands

This API utilizes express, node-fetch, and canvas.

The following commands will compile and start the api.

```
npx tsc
npm start
```

### The API urls:

```
http://localhost:3000/analyze
```

### POST data

Replace john with your name, and Bulbasaur with your favorite pokemon!

```
POST = {"data": "john-Bulbasaur"}
```

### GET data

After a successful POST from above, you make a GET request to return your pokemon image, or it can be found in the projects root directory.

```
GET = http://localhost:3000/YourCard.png
```

### The Response Data

1. The following is an example of a successful POST and following GET request

```
Response Data = { "statusCode":200, "data":{"mixedName": "Johnasaur", "para": "Johnasaur, bringing joy, they are a grass-type creature, loves the outdoors, terrified of lawnmowers.", img": "YourCard.png" } }
```

mixedName is the mixed first and pokemons name, para is the analysis paragraph, and lastly img is the path of the image output.

Successful POST Example
![POST](https://i.imgur.com/3NLBX6l.png)

Successful GET Example
![GET](https://i.imgur.com/SW6uKIx.png)
