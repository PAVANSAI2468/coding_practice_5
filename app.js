const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
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
  //response.send(dbobj.map((moviename) => responseObj(moviename)));
  response.send(dbobj);
});
app.get("/movies/:movieId/", async (request, response) => {
  const [movieId] = request.params;
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
  response.send("Movie successfully added");
});
