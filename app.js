import { dirname } from "path";
import { fileURLToPath } from 'url';
import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';

// Routers
import router from "./src/routes/index.js" // main router that routes to all pages

// Database modules
import { connectToMongo } from "./src/db/conn.js";
import { connectToMongoose } from "./src/db/mongodb.js";
import { initializeCollections} from "./src/db/innit.js";

// Model
import userOP from "./models/user.js";


async function main () {
    const DB_URL = process.env.MONGODB_URI;
    connectToMongo((err) => {
        console.log("Attemping connection")
            if (err) {
                console.log("An error has occured: ");
                console.error(err);
                process.exit();
            }
            console.log("Connected to MongoDB");
            initializeCollections(); // populate mongodb
    });
    connectToMongoose(DB_URL);

    const __dirname = dirname(fileURLToPath(import.meta.url)); // directory URL
    const app = express();
    app.use("/static", express.static(__dirname + "/public"));

    app.engine("hbs", exphbs.engine({
        extname: 'hbs',
        helpers: {
            formatDate: function(dateString, format) {
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear().toString();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');

                return `${day}/${month}/${year} ${hours}:${minutes}`;
            },
            eq: function (a, b) {
                return a === b;
            },
            or: function (a, b) {
                return a || b;
            }
        }
    }));
    app.set("view engine", "hbs");

    app.set("views", "./src/views");

    app.set("view cache", false);

    app.use(express.json());

    // sid.signature
    app.use(session({
        secret: "thisismysecret!",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000*60*60*24*21,
            httpOnly: true
        }
    }));
    
    app.use(express.urlencoded({extended: true})) // for reading information passed to the website
    
    // const user = await userOP.find({
    //     username: "Nootie"
    // }).lean();

    // app.locals.user = user;
    app.use(router);
    

    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    
    // App listener    
    app.listen(process.env.PORT, () =>{
        console.log("Express app now listening...");
    });
}

main();
