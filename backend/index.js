const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "백엔드 서버 정상 작동 중 🚀" });
});

app.listen(4000, () => {
  console.log("서버 실행 중: http://localhost:4000");
});
