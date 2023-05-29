import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

dotenv.config();
app.use(cookieParser());

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("register", () => {
  test("Registration - Done", (done) => {
    const user = {
      username: "Test1",
      email: "test1@test1.com",
      password: "Test1",
    };

    request(app)
      .post("/api/register")
      .send(user)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          data: {
            message: expect.stringContaining(
              `User ${user.username} added succesfully`
            ),
          },
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Registration - Invalid Email", (done) => {
    const user = {
      username: "Test1",
      email: "test1",
      password: "Test1",
    };

    request(app)
      .post("/api/register")
      .send(user)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringContaining(`Invalid email`),
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Registration - Already Registered", (done) => {
    const user = {
      username: "Test1",
      email: "test1@test1.com",
      password: "Test1",
    };

    User.create(user).then(() => {
      request(app)
        .post("/api/register")
        .send(user)
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            message: expect.stringContaining(`you are already registered`),
          });
          done();
        })
        .catch((err) => done(err));
    });
  });
});

describe("registerAdmin", () => {
  let user, accessToken, refreshToken;

  beforeEach(async () => {
    await User.deleteMany({});

    user = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
    };

    accessToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Admin",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );

    refreshToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
  });
  test("Register Admin - Done", async () => {
    const response = await request(app)
      .post("/api/admin")
      .send(user)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: { message: `Admin ${user.username} added succesfully` },
    });
  });

  test("Register Admin - not authorized", async () => {
    accessToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "User",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );

    refreshToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "User",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );

    const response = await request(app)
      .post("/api/admin")
      .send(user)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ]);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: expect.stringContaining(`Unauthorized`),
    });
  });

  test("Register Admin - Missing Information", async () => {
    delete user.email;

    const response = await request(app)
      .post("/api/admin")
      .send(user)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ]);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: expect.stringContaining(`Missing or Empty fields`),
    });
  });

  test("Register Admin - Already Registered", async () => {
    await User.create(user);

    const response = await request(app)
      .post("/api/admin")
      .send(user)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ]);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: expect.stringContaining(`you are already registered`),
    });
  });
});

describe("login", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("logout", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});
