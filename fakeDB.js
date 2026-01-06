export const users = [
  {
    userID: "1",
    username: "dummy",
    email: "dummy937822@gmail.com",
    password: "123",
  }, // Dummy user
];

// This array acts like your 'jobs' table
export const jobs = [
  {
    jobID: "1",
    refID: "1",
    userID: "1",
    company: "Google",
    job_location: "remote",
    date: "2026-01-14",
    status: "applied",
    link: "abc.com",
    notes: "notey notes",
  },
];
//we can distinguish a persons job list based on the userID instead of making an arr of
//jobs for each user...just find the job using the userID and update or delete the job you want
