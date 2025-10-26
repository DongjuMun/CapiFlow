const express = require('express');
const path = require('path');
const PORT = 8080;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

const sme_routes = require("./routes/sme.routes");
app.use("/sme", sme_routes);

const investor_routes = require("./routes/investor.routes");
app.use("/investor", investor_routes);

const user_routes = require("./routes/user.routes");
app.use("/user", user_routes);

app.listen(PORT,
    () => console.log(`alive on http://localhost:${PORT}`)
)