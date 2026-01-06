import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { users } from "./fakeDB.js";
import { jobs } from "./fakeDB.js";
import nodemailer from "nodemailer";
import session from "express-session";
import crypto from "crypto";
import { error } from "console";

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

const pendingVerification = {}; //temp otp's
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "harshitsinghbisht12@gmail.com",
    pass: "bqyk ihhy enos pybz",
  },
  // auth: {
  //   type: "OAuth2",
  //   user: "dummy937822@gmail.com",
  //   accessToken: "generated_access_token",
  //   expires: 1484314697598, // Token expiration timestamp in milliseconds
  // },
});

//Middlewares
app.use(express.json()); //so that express can read JSON sent by fetch api rewuest
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  //parses data for session before hitting every route
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 },
    rolling: true,
  })
);
function requireAuth(req, res, next) {
  //middleware for non repetation
  if (!req.session.userID) {
    return res.redirect("/login");
  }
  next();
}

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
  if (!req.session.userID) {
    return res.redirect("/login"); // Kick them out if no session
  }
  const currentUserID = req.session.userID;
  const userJobs = jobs.filter((job) => job.userID === currentUserID); //arr of jobs
  res.render("dashboard.ejs", {
    userJobs: userJobs, //all jobs of the user of the current sessionID
  });
});

app.get("/jobs/create", requireAuth, (req, res) => {
  // const currentUserID = req.session.userID;
  res.render("create-job.ejs");
});
app.post("/jobs/add", requireAuth, (req, res) => {
  const currentUserID = req.session.userID;
  const { company_name, job_location, date, status, link, notes } = req.body;

  // --- 1. VALIDATION LAYER (Professional Standard) ---

  // Check required fields
  if (!company_name || !status) {
    // In a real app, you'd send an error message (Flash Message)
    console.error("Validation Failed: Missing fields");
    return res.redirect("/jobs/create");
  }

  // Check Allowed Values (Enums)
  // We don't want "status" to be "idk maybe". It must be specific.
  const allowedStatuses = ["applied", "interview", "offer", "rejected"];
  if (!allowedStatuses.includes(status)) {
    console.error("Validation Failed: Invalid Status");
    return res.redirect("/jobs/create");
  }

  // --- 2. DATA SANITIZATION (Optional but good) ---
  // Ensure the link actually starts with http/https
  let secureLink = link;
  if (link && !link.startsWith("http")) {
    secureLink = "https://" + link;
  }
  const referenceJobID = crypto.randomBytes(6, (err) => {
    console.log(err);
  });

  const newJob = {
    jobID: crypto.randomUUID(),
    //arr has 5 jobs and person remove 4th one and add another job we'll have 2 jobs with same id
    //which must be avoided cuz jobs must have unique id to identify each
    refID: crypto.randomBytes(3).toString("hex").toUpperCase(),
    userID: currentUserID,
    company: company_name.trim(), // Remove extra spaces
    job_location: job_location,
    date: date || new Date().toISOString().split("T")[0], // Default to today if empty
    status: status,
    link: secureLink,
    notes: notes,
  };
  jobs.push(newJob);
  res.redirect("/dashboard");
});

app.post("/jobs/update", (req, res) => {
  // displays a popup and update the job in DB within the same page
  console.log("updating the job");
  res.redirect("/dashboard");
});

app.post("/jobs/delete", requireAuth, (req, res) => {
  // 1. Get the ID sent from the hidden input
  // html always sends string so convert to number for conversion
  const idToDelete = req.body.jobID;
  console.log(idToDelete);

  // 2. Find the index of the job with that ID
  // We also check userID to make sure they own it!
  const index = jobs.findIndex(
    (job) => job.jobID === idToDelete && job.userID === req.session.userID
  );

  if (index > -1) {
    jobs.splice(index, 1); // Remove it
    console.log("Job Deleted!");
  } else {
    console.log("Job not found or unauthorized");
  }
  res.redirect("/dashboard");
});
app.get("/jobs/view/:id", requireAuth, (req, res) => {
  const viewJob = jobs.find(
    (job) => job.jobID === req.params.id && job.userID === req.session.userID
  );
  res.send(`<h1>Company: ${viewJob.company} <br>
    Job Location: ${viewJob.job_location}<br>
    Date of Application: ${viewJob.date} <br>
    Application Status: ${viewJob.status} <br>
    Unique JobID: ${viewJob.jobID}<h1>`);
});
app.post("/jobs/update-api", requireAuth, (req, res) => {
  const currentUserID = req.session.userID;
  const { company_name, job_location, date, status, link, notes, jobID } =
    req.body;
  const editJob = jobs.find(
    (job) => job.jobID === jobID && job.userID === currentUserID
  );
  if (editJob) {
    editJob.company = company_name;
    editJob.job_location = job_location;
    editJob.date = date;
    editJob.status = status;
    editJob.link = link;
    editJob.notes = notes;
    res.json({ success: true, message: "Updated!" });
  } else {
    res.status(404).json({ success: false, message: "Job not found" });
  }
});

app.post("/auth/login", (req, res) => {
  // Authenticate: check if mail and password is in DB and matches
  //hasing is one way so if email also hashed wont know whats uers email
  //see if email exists in DB, if yes then hash the password and check if it matches the password in DB

  // const userEmail = req.body.email;
  // const userPass = req.body.password;
  const { email, password } = req.body; //object destructing: modern way to unpack properties from obj to variables
  console.log(email + password);
  // for (let i = 0; i < users.length; i++) {
  // bad practice..if redirect inside loop the loop keeps running if loop finishes it sends a second redirectcrashing the app
  const user = users.find((u) => u.email === email); //user type: object(if match found), undefined(if no match found)
  //checks every object inside the arr and u is the placeholder for the current object being checked
  if (!user) {
    console.log("Email doesnt exist!");
    res.redirect("/login");
  } else if (user.password === password) {
    req.session.userID = user.userID;
    console.log("Loggin in!" + req.session.userID);
    res.redirect("/dashboard");
  } else {
    console.log("Wrong password");
    return res.redirect("/login");
  }
});
app.post("/auth/signup", async (req, res) => {
  //check if the email is an actual account(optional)
  // check if email already exists if yes back to login
  //if not hash the password and store the email and hashed password to DB

  const { username, email, password } = req.body;
  // CHECK: Does this email already exist?
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    console.log("User already exists!");
    return res.redirect("/login"); // Stop here. Don't create a new one.
  }

  const otp = Math.floor(1000 + Math.random() * 9000);

  pendingVerification[email] = {
    otp: otp,
    username: username,
    password: password,
  }; //making a spot email inside this object and the 3 vars are inside the email variable
  try {
    await transporter.sendMail({
      from: '"Job Application Tracker" <harshitsinghbisht12@gmail.com>',
      to: email,
      subject: "Verify your account",
      text: `Your verification code is: ${otp}`,
      html: `<b>Your verification code is:<strong style="color: blue;">${otp}</strong></b>`,
      replyTo: `<support@gmail.com>`,
    });
    console.log(`Email sent to ${email} with code ${otp}`);
    res.render("verify-otp.ejs", { email: email });
  } catch (error) {
    console.log(error);
    // res.send("Error sending email,"); cannot send this to page and redirect at the same time
    res.redirect("/signup");
  }
});
app.post("/auth/verify", (req, res) => {
  const { email, otp } = req.body;
  const record = pendingVerification[email];
  if (record && record.otp == otp) {
    const newUser = {
      userID: crypto.randomUUID(),
      username: record.username,
      email: email,
      password: record.password,
    };
    users.push(newUser);
    delete pendingVerification[email]; //deleting using bracket notation
    console.log("User Verified and created!");
    transporter.sendMail({
      from: '"Job Application Tracker" <harshitsinghbisht12@gmail.com>',
      to: email,
      subject: "Welcome!",
      text: `Welcome to the platform`,
      attachments: [
        {
          filename: "welcome.txt",
          content: "Welcome to the Platform!",
        },
      ],
      replyTo: `<support@gmail.com>`,
    });
    res.redirect("/login");
  } else {
    res.send("Invalid Code or Email!");
  }
});
app.get("/logout", requireAuth, (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      return res.redirect("/dashboard"); // If fail, keep them logged in?
    }
    // Only redirect once we are 100% sure the session is gone
    res.clearCookie("connect.sid"); // Optional: Force delete cookie on browser too
    res.redirect("/login");
  });
});
// app.all("*", (req, res) => {
//   // Set status to 404 (Important for SEO/Bots) and render a page
//   res.status(404).render("404.ejs");
// });
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
