import request from "supertest";
import { app } from "../app";
import { Group, User } from "../models/User.js";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
const jwt = require("jsonwebtoken");

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();

let accessToken, refreshToken;

beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {
  let admin, user1, user2;

  beforeEach(async () => {
    await User.deleteMany({});

    admin = {
      username: "admin",
      password: "admin",
      email: "admin@email.com",
      refreshToken: refreshToken,
      role: "Admin",
    };

    user1 = {
      username: "user1",
      password: "user1",
      email: "user1@email.com",
      role: "Regular",
    };

    user2 = {
      username: "user2",
      password: "user2",
      email: "user2@email.com",
      role: "Regular",
    };

    accessToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );

    refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
  });

  test("GetUsers - Success with filled list", (done) => {
    const expectedUsers = [
      {
        username: "admin",
        email: "admin@email.com",
        role: "Admin",
      },
      {
        username: "user1",
        email: "user1@email.com",
        role: "Regular",
      },
      {
        username: "user2",
        email: "user2@email.com",
        role: "Regular",
      },
    ];

    User.create(admin, user1, user2).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: expect.arrayContaining(expectedUsers),
            refreshTokenMessage: response.body.refreshTokenMessage,
          });
          done();
        });
    });
  });

  test("GetUsers - Success with empty list", (done) => {
    request(app)
      .get("/api/users")
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          data: [],
          refreshTokenMessage: response.body.refreshTokenMessage,
        });
        done();
      });
  });

  test("GetUsers - Unauthorized", (done) => {
    User.create(admin, user1, user2).then(() => {
      request(app)
        .get("/api/users")
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toEqual({
            error: expect.stringMatching(/Unauthorized/),
          });
          done();
        });
    });
  });
});

describe("getUser", () => {
  describe("User", () => {
    let user;

    beforeEach(async () => {
      await User.deleteMany({});

      user = {
        username: "user",
        password: "user",
        email: "user@email.com",
      };

      accessToken = jwt.sign(
        {
          username: user.username,
          email: user.email,
          password: user.password,
          role: "Regular",
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
          role: "Regular",
        },
        "EZWALLET",
        { expiresIn: "7d" }
      );

      user.refreshToken = refreshToken;
    });

    test("GetUser - Success", (done) => {
      User.create(user).then(() => {
        request(app)
          .get(`/api/users/${user.username}`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
              data: {
                username: user.username,
                email: user.email,
                role: "Regular",
              },
              refreshTokenMessage: response.body.refreshTokenMessage,
            });
            done();
          });
      });
    });

    test("GetUser - Unauthorized - Refresh tokens don't match", (done) => {
      user.refreshToken = "";

      User.create(user).then(() => {
        request(app)
          .get(`/api/users/${user.username}`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
              error: expect.stringMatching(/Unauthorized/),
              refreshTokenMessage: response.body.refreshTokenMessage,
            });
            done();
          });
      });
    });

    test("GetUser - User not found", (done) => {
      request(app)
        .get(`/api/users/${user.username}`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/User not found/),
            refreshTokenMessage: response.body.refreshTokenMessage,
          });
          done();
        });
    });
  });

  describe("Admin", () => {
    let admin, user;

    beforeEach(async () => {
      await User.deleteMany({});

      admin = {
        username: "admin",
        password: "admin",
        email: "admin@email.com",
      };

      user = {
        username: "user",
        password: "user",
        email: "user@email.com",
      };

      accessToken = jwt.sign(
        {
          username: admin.username,
          email: admin.email,
          password: admin.password,
          role: "Admin",
        },
        "EZWALLET",
        {
          expiresIn: "1h",
        }
      );

      refreshToken = jwt.sign(
        {
          username: admin.username,
          email: admin.email,
          password: admin.password,
          role: "Admin",
        },
        "EZWALLET",
        { expiresIn: "7d" }
      );

      admin.refreshToken = refreshToken;
    });

    test("GetUser - Success", (done) => {
      User.create(admin, user).then(() => {
        request(app)
          .get(`/api/users/${user.username}`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
              data: {
                username: user.username,
                email: user.email,
                role: "Regular",
              },
              refreshTokenMessage: response.body.refreshTokenMessage,
            });
            done();
          });
      });
    });

    test("GetUser - Unauthorized", (done) => {
      User.create(admin, user).then(() => {
        request(app)
          .get(`/api/users/${user.username}`)
          .then((response) => {
            expect(response.status).toBe(401);
            expect(response.body).toEqual({
              error: "Unauthorized",
            });
            done();
          });
      });
    });

    test("GetUser - User not found", (done) => {
      User.create(admin).then(() => {
        request(app)
          .get(`/api/users/${user.username}`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
              error: expect.stringMatching(/User not found/),
              refreshedTokenMessage: response.body.refreshedTokenMessage,
            });
            done();
          });
      });
    });
  });
});

describe("createGroup", () => {
  let user;

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    user = {
      username: "user",
      password: "user",
      email: "user@email.com",
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
  });

  test("CreateGroup - Success", (done) => {
    let user1 = {
      username: "user1",
      password: "user1",
      email: "user1@email.com",
    };

    let user2 = {
      username: "user2",
      password: "user2",
      email: "user2@email.com",
    };

    User.create(user, user1, user2).then(() => {
      request(app)
        .post("/api/groups")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: "GroupName",
          memberEmails: [user.email, user1.email, user2.email],
        })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: {
              group: expect.objectContaining({
                name: "GroupName",
                members: expect.arrayContaining([
                  expect.objectContaining({ email: user.email }),
                  expect.objectContaining({ email: user1.email }),
                  expect.objectContaining({ email: user2.email }),
                ]),
              }),
              alreadyInGroup: [],
              membersNotFound: [],
            },
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        })
        .catch((error) => {
          done(error); // Chiamata a done con l'errore in caso di fallimento del test
        });
    });
  });
});

describe("getGroups", () => {});

describe("getGroup", () => {});

describe("addToGroup", () => {});

describe("removeFromGroup", () => {});

describe("deleteUser", () => {});

describe("deleteGroup", () => {});
