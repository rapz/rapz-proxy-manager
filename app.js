const express = require('express');
const app = express();

app.get("/", (_, res) => {
    res.send("HEALTHCHECK OK! v3")
})

app.listen(5100)