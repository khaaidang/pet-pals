import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "khaaidang.tech",
    user: "khaaidan_webuser",
    password: "CSUMB-cst336",
    database: "khaaidan_pet_pals",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();

// Default Route
app.get('/', (req, res) => {
   res.send('Hello Express app!')
});

// API Routes
app.get('/dogs', async(req, res) => {

    let rottweilerUrl = `https://dog.ceo/api/breed/rottweiler/images`;
    let rottweilerResponse = await fetch(rottweilerUrl);
    let rottweilerData = await rottweilerResponse.json();

    let akitaUrl = `https://dog.ceo/api/breed/akita/images`;
    let akitaResponse = await fetch(akitaUrl);
    let akitaData = await akitaResponse.json();

    let germanUrl = `https://dog.ceo/api/breed/germanshepherd/images`;
    let germanResponse = await fetch(germanUrl);
    let germanData = await germanResponse.json();

    res.render("dogs", {
        rottweiler: rottweilerData.message[45],
        akita: akitaData.message[2],
        german: germanData.message[1]
    });

});

app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})