import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/homepage.html");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
app.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs");
});
app.get("/create-job", (req, res) => {
  res.render("create-job.ejs");
});
app.get("/update-job", (req, res) => {
  // instead of rendering a update file just use a popup to update on same page
  res.render("update-job.ejs");
});
app.get("/delete-job", (req, res) => {
  // instead of rendering a delete file delete on the same page
  res.render("delete-job.ejs");
});
app.post("/auth/login", (req, res) => {
  // Authenticate: check if mail and password is in DB and matches
  res.redirect("/dashboard");
});
app.post("/auth/signup", (req, res) => {
  // Check if email and password provided is correct
  res.redirect("/dashboard");
});
app.post("/jobs/add", (req, res) => {
  //process and store the job details in DB and redirect to dashboard
  res.redirect("/dashboard");
});
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
