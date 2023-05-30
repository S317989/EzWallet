import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config();

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
  beforeEach(async () => {
    await User.deleteMany({});
  });
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
  });
  test("Register Admin - Done", async () => {
    const response = await request(app).post("/api/admin").send(user);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: { message: `Admin ${user.username} added succesfully` },
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
  let user;
  beforeEach(async () => {
    await User.deleteMany({});

    let pswcrpt = await bcrypt.hash("Test1", 12);

    user = {
      username: "Test1",
      email: "test1@test1.com",
      password: pswcrpt,
    };
  });

  test("Login - Done", (done) => {
    User.create(user).then(() => {
      request(app)
        .post("/api/login")
        .send({
          email: user.email,
          password: "Test1",
        })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: {
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            },
          });
          done();
        })
        .catch((err) => done(err));
    });
  });

  test("Login - Missing or Empty Field", (done) => {
    User.create(user).then(() => {
      request(app)
        .post("/api/login")
        .send({
          email: user.email,
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringContaining("Missing or Empty fields"),
          });
          done();
        })
        .catch((err) => done(err));
    });
  });

  test("Login - Not registered", (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: user.email,
        password: "Test1",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringContaining("please you need to register"),
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Login - Wrong Credentials", (done) => {
    User.create(user).then(() => {
      request(app)
        .post("/api/login")
        .send({
          email: user.email,
          password: "Test2",
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringContaining("wrong credentials"),
          });
          done();
        })
        .catch((err) => done(err));
    });
  });
});

describe("logout", () => {
  let user, accessToken, refreshToken;
  beforeEach(async () => {
    await User.deleteMany({});

    user = {
      username: "Test1",
      email: "test1@test1.com",
      password: "Test1",
    };

    accessToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Simple",
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
        role: "Simple",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;

    await User.create(user);
  });

  test("Logout - Done", (done) => {
    request(app)
      .get("/api/logout")
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          data: { message: "logged out" },
        });
        done();
      });
  });

  test("Logout - Already logged out", (done) => {
    request(app)
      .get("/api/logout")
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: "you are already logged out",
        });
        done();
      });
  });

  test("Logout - User not found - find", (done) => {
    User.deleteMany({}).then(() => {
      request(app)
        .get("/api/logout")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: "user not found",
          });
          done();
        });
    });
  });
});
