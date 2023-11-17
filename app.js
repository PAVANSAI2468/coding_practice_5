const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
function responseObj(obj) {
  return {
    movieName: obj.movie_name,
  };
}
function responseObj2(obj) {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
}
app.get("/movies/", async (request, response) => {
  const getmovieArr = `select * from movie`;
  const dbobj = await db.all(getmovieArr);
  response.send(dbobj.map((moviename) => responseObj(moviename)));
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviename = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const dbmoviename = await db.get(moviename);
  response.send(responseObj2(dbmoviename));
});
app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const addDetails = `INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbAdd = await db.run(addDetails);
  response.send("Movie Successfully Added");
});
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateDetails = `UPDATE movie SET director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
  WHERE movie_id=${movieId}`;
  const sendDetails = await db.run(updateDetails);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteMoviequery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  const deletedMovie = await db.get(deleteMoviequery);
  res.send("Movie Removed");
});
function responseObj3(obj) {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
}
function responseObj4(obj) {
  return {
    movieName: obj.movie_name,
  };
}
app.get("/directors/", async (request, response) => {
  const getdirectorArr = `select director_id,director_name from director`;
  const dbobj = await db.all(getdirectorArr);
  response.send(dbobj.map((item) => responseObj3(item)));
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviename = `SELECT movie_name FROM director INNER JOIN movie ON director.director_id=movie.director_id WHERE director.director_id=${directorId};`;
  const dbmoviename = await db.all(moviename);
  response.send(dbmoviename.map((item) => responseObj4(item)));
});
module.exports = app;
