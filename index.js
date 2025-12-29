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
app.get("/jobs/create", (req, res) => {
  res.render("create-job.ejs");
});
// app.get("/update-job", (req, res) => {
//   // instead of rendering a update file just use a popup to update on same page
//   res.render("update-job.ejs");
// });
// app.get("/delete-job", (req, res) => {
//   // instead of rendering a delete file delete on the same page
//   res.render("delete-job.ejs");
// });
app.post("/jobs/update", (req, res) => {
  // displays a popup and update the job in DB within the same page
  console.log("updating the job");
  res.redirect("/dashboard");
});
app.post("/jobs/delete", (req, res) => {
  // deletes the job in DB within the same page
  console.log("deleting the job");
  res.redirect("/dashboard");
});
app.post("/auth/login", (req, res) => {
  // Authenticate: check if mail and password is in DB and matches
  //hasing is one way so if email also hashed wont know whats uers email
  //see if email exists in DB, if yes then hash the password and check if it matches the password in DB
  console.log("Logging in");
  res.redirect("/dashboard");
});
app.post("/auth/signup", (req, res) => {
  //check if the email is an actual account(optional)
  // check if email already exists if yes back to login
  //if not hash the password and store the email and hashed password to DB
  console.log("Signing up");
  res.redirect("/dashboard");
});
app.post("/jobs/add", (req, res) => {
  //process and store the job details in DB and redirect to dashboard
  console.log("Adding a Job");
  res.redirect("/dashboard");
});
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
