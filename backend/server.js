import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET_KEY;

app.use(express.json()); // use json middleware for request parsing

const users = [
  {
    id: 0,
    username: "djeune",
    // store the hash pw
    password: await bcrypt.hash("password", 10),
  },
];
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: "1h", // expires the token
  });
};

// Auth endpoint
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  // find users in mock db
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });

  // verify pw
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(401), json({ message: "Invalid password" });

  // generate and send token on success
  const token = generateToken(user);
  res.json({ token });

  // token verification middleware for protected routes
  const authenticationToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Token is required" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  };
  // protected route
  app.get("/protected", authenticationToken, (req, res) => {
    res.json({ message: "This is a protected data.", user: req.user });
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
