import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import fs from "fs";
import md5 from "md5"
const app = express();
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "100mb" }));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.post("/upload", (req, res) => {
  const { name, size, currentChunkIndex, totalChunk } = req.query;
  const firstChunk = parseInt(currentChunkIndex) === 0;
  const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunk) - 1;
  const extension = name.split(".").pop();
  const data = req.body.toString().split(",")[1];
  const buffer = new Buffer.from(data);
  const tmpFilename = "tmp_" + md5(name + req.ip) + "." + extension
  if(firstChunk) fs.unlinkSync(`./uploads/${tmpFilename}`);
  fs.appendFileSync(`./uploads/${tmpFilename}`, buffer);
  if(lastChunk){
    const finalFileName = md5(Date.now()).substring(0,6) + "." + extension;
    fs.renameSync(`./uploads/${tmpFilename}`,`./uploads/${finalFileName}`)
    res.send({ success: true, result: finalFileName });
  }
});

app.listen(5001);
