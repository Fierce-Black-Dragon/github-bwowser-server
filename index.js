import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import querystring from "querystring";
import pkg from "lodash";
import axios from "axios";
import url from "url";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();

const { get } = pkg;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const PORT = process.env.PORT || 5000;
app.use(cors());
// base route
app.get("/", (req, res) => {
  res.send(" Backend api  is alive!");
});
app.listen(
  PORT,
  console.log(` server started and runing on http://localhost:${PORT}`)
);

async function getGitHubUser(code) {
  const githubToken = await axios
    .post(
      `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
    )
    .then((res) => res.data)

    .catch((error) => {
      throw error;
    });

  const decoded = querystring.parse(githubToken);

  const accessToken = decoded.access_token;
  let result = {};
  return axios
    .get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then(
      (res) =>
        (result = {
          data: res.data.login,
          accessToken: accessToken,
        })
    )
    .catch((error) => {
      console.error(`Error getting user from GitHub`);
      throw error;
    });
}

app.post("/api/auth/github/:code", async (req, res) => {
  const { code } = req.params;

  const gitHubUser = await getGitHubUser(code);

  res.status(200).json({ gitHubUser });
});
