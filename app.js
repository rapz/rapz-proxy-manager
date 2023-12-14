const express = require('express');
const app = express();

app.get("/", (_, res) => {
    res.send("HEALTHCHECK OK! v2")
})

app.listen(5100)