const express = require('express');
const app = express();

app.get("/", (_, res) => {
    res.send("HEALTHCHECK OK!")
})

app.listen(5100)