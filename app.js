const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')
app.use(express.json())
let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Runing at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Db Error: ${error.message}`)
    process.exit(1)
  }
}

initialize()

const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadAcor: dbObject.lead_actor,
  }
}

const convertDirectonDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuerry = `
       SELECT movie_name
       FROM movie;
    `

  const moviesArray = await db.all(getMoviesQuerry)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuerry = `
       INSERT INTO 
            movie (director_id, movie_name, lead_actor)
       VALUES 
           (${directorId}, '${movieName}', '${leadActor}');     
    `
  await db.run(postMovieQuerry)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuerry = `
       SELECT movie_name
       FROM movie
       WHERE 
          movie_id=${movieId};
    `

  const moviesArray = await db.all(getMovieQuerry)
  response.send(convertMovieDbObjectToResponseObject(moviesArray))
})
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const putMovieQuerry = `
        UPDATE movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE 
               movie_id = ${movieId};`
  await db.run(putMovieQuerry)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
       DELETE
       FROM 
          movie 
       WHERE 
          movie_id=${movieId};
      `
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director;
   `
  const directorDetails = await db.all(getDirectorsQuery)
  response.send(
    directorDetails.map(eachDirector =>
      convertDirectonDbObjectToResponseObject(eachDirector),
    ),
  )
});

app.get("/directors/:directorId/movies/", async (request, response)=>{
   const {directorId}=request.params;
   const getDirectorQuery=`
       SELECT movie_name
       FROM movie 
       WHERE 
        director_id=${directorId};`;
    const movieQuery=await db.all(getDirectorQuery);
    response.send(movieQuery.map((eachMovie)=>({movieName : eachMovie.movie_name})));
});

module.exports = app
