import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

// Setting up Express Session
app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

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


// Functions
function isAuthenticated(req,res,next) {
    if (!req.session.authenticated) {
        res.redirect("/");
    }
    else {
        next();
    }
}

// Default Route
app.get('/', (req, res) => {
   res.render('index');
});

app.get('/login', async (req, res) => {
    res.render("login");
})

app.post('/login', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let passwordHash = "";

    let sql = `SELECT *
               FROM users
               WHERE username = ?`;
    const[rows] = await conn.query(sql, [username]);

    if (rows.length > 0) {
        passwordHash = rows[0].password;
    }
    let match = await bcrypt.compare(password, passwordHash);

    if (match) {
        req.session.authenticated = true;
        res.render("main", { username });
    }
    else {
        res.render("login", {"error": "Invalid username or password."});
    }
});

app.get('/register', async(req, res) => {
    res.render("register");
});

app.post('/register', async (req, res) => {
    let username = req.body.username;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
    let passwordHash = await bcrypt.hash(password, 10);
    let admin = 0;

    let sql = `INSERT INTO users
               (username, first_name, last_name, email, password, admin)
               VALUES (?, ?, ?, ?, ?, ?)`;
    let params = [username, firstName, lastName, email, passwordHash, admin];
    const[rows] = await conn.query(sql, params);
    
    req.session.authenticated = true;
    req.session.admin = admin; // Stores whether or not this user is an admin in session
    res.render("main", { username });
});

// In My Profile, Users will be able to see the adoption requests they've submitted which will access our local API to the request table
app.get('/myProfile', isAuthenticated, (req, res) => {
    res.render("myProfile");
});

app.get('/main', isAuthenticated, async (req, res) => {
    res.render("main");
});

app.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get('/pets', async(req, res) => {
    res.render("pets");
});

app.get('/pets/:id', async(req, res) => {
    res.render("pets");
});


// Local API Routes

// Route to get all pets
app.get('/api/pets', async(req, res) => {
    let sql = `SELECT *
               FROM pets`;
    const [rows] = await conn.query(sql);
    res.send(rows);
});

// Route to get one pet by ID
app.get('/api/pets/:id', async(req, res) => {
    let petId = req.params.id;

    let sql = `SELECT *
               FROM pets
               WHERE id = ?`;
    let param = [petId];
    const [rows] = await conn.query(sql, param);
    res.send(rows[0]);
});

app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})