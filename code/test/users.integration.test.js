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

  test("CreateGroup - Success - User in list", (done) => {
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

  test("CreateGroup - Success - User not in list", (done) => {
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
          memberEmails: [user1.email, user2.email],
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

  test("CreateGroup - Unauthorized", (done) => {
    request(app)
      .post("/api/groups")
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: expect.stringMatching(/Unauthorized/),
        });
        done();
      })
      .catch((error) => {
        done(error); // Chiamata a done con l'errore in caso di fallimento del test
      });
  });

  test("CreateGroup - Missing parameters", (done) => {
    request(app)
      .post("/api/groups")
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({
        name: "GroupName",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(/Missing parameters/),
          refreshedTokenMessage: response.refreshedTokenMessage,
        });
        done();
      })
      .catch((error) => {
        done(error); // Chiamata a done con l'errore in caso di fallimento del test
      });
  });

  test("CreateGroup - Group already exists", (done) => {
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

    User.create(user, user1, user2).then(async () => {
      await Group.create({ name: "GroupName", members: [user1, user2] });
      request(app)
        .post("/api/groups")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: "GroupName",
          memberEmails: [user1.email, user2.email],
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/Group already exists/),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        })
        .catch((error) => {
          done(error); // Chiamata a done con l'errore in caso di fallimento del test
        });
    });
  });

  test("CreateGroup - User already in a group", (done) => {
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

    User.create(user, user1, user2).then(async () => {
      await Group.create({ name: "GroupName2", members: [user] });
      request(app)
        .post("/api/groups")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: "GroupName",
          memberEmails: [user1.email, user2.email],
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/User already in a group/),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        })
        .catch((error) => {
          done(error); // Chiamata a done con l'errore in caso di fallimento del test
        });
    });
  });

  test("CreateGroup - Invalid email format", (done) => {
    let user1 = {
      username: "user1",
      password: "user1",
      email: "user1",
    };

    let user2 = {
      username: "user2",
      password: "user2",
      email: "user2@email.com",
    };

    User.create(user, user1, user2).then(async () => {
      request(app)
        .post("/api/groups")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: "GroupName",
          memberEmails: [user1.email, user2.email],
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/Invalid email format/),
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

describe("getGroups", () => {
  let admin;

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    admin = {
      username: "admin",
      password: "admin",
      email: "admin@email.com",
      refreshToken: refreshToken,
      role: "Admin",
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

  test("GetGroups - Success with filled list", (done) => {
    let group1, group2;

    group1 = {
      name: "GroupName1",
      members: [
        { email: "user1@email.com", id: "1" },
        { email: "user2@email.com", id: "2" },
      ],
    };

    group2 = {
      name: "GroupName2",
      members: [
        { email: "user3@email.com", id: "1" },
        { email: "user4@email.com", id: "2" },
      ],
    };

    Group.create(group1, group2).then(() => {
      request(app)
        .get("/api/groups")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: expect.arrayContaining([
              expect.objectContaining({
                name: "GroupName1",
                members: expect.arrayContaining([
                  expect.objectContaining({ email: "user1@email.com" }),
                  expect.objectContaining({ email: "user2@email.com" }),
                ]),
              }),
              expect.objectContaining({
                name: "GroupName2",
                members: expect.arrayContaining([
                  expect.objectContaining({ email: "user3@email.com" }),
                  expect.objectContaining({ email: "user4@email.com" }),
                ]),
              }),
            ]),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        })
        .catch((error) => {
          done(error); // Chiamata a done con l'errore in caso di fallimento del test
        });
    });
  });

  test("GetGroups - Success with empty list", (done) => {
    request(app)
      .get("/api/groups")
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          data: [],
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        });
        done();
      })
      .catch((error) => {
        done(error); // Chiamata a done con l'errore in caso di fallimento del test
      });
  });

  test("GetGroups - Unauthorized", (done) => {
    request(app)
      .get("/api/groups")
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: expect.stringMatching(/Unauthorized/),
        });
        done();
      })
      .catch((error) => {
        done(error); // Chiamata a done con l'errore in caso di fallimento del test
      });
  });
});

describe("getGroup", () => {
  let user, admin, group;
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    user = {
      username: "user",
      password: "user",
      email: "user@email.com",
    };

    admin = {
      username: "admin",
      password: "admin",
      email: "admin@email.com",
    };

    group = {
      name: "GroupName",
      members: [
        { email: "user@email.com", id: "1" },
        { email: "user1@email.com", id: "2" },
      ],
    };
  });

  test("GetGroup - Group doens't exists", (done) => {
    request(app)
      .get(`/api/groups/${group.name}`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(
            `The group '${group.name}' doesn't exist!`
          ),
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        });
        done();
      })
      .catch((error) => {
        done(error); // Chiamata a done con l'errore in caso di fallimento del test
      });
  });

  describe("Admin", () => {
    beforeEach(async () => {
      // JWT sign for admin value
      accessToken = jwt.sign(
        {
          username: admin.username,
          email: admin.email,
          password: admin.password,
          role: "Admin",
        },

        "EZWALLET",
        { expiresIn: "1h" }
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

    test("GetGroup - Success", (done) => {
      Group.create(group).then(() => {
        request(app)
          .get(`/api/groups/${group.name}`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .send({ name: group.name })
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
              data: expect.objectContaining({
                name: "GroupName",
                members: expect.arrayContaining([
                  expect.objectContaining({ email: user.email }),
                  expect.objectContaining({ email: "user1@email.com" }),
                ]),
              }),
              refreshedTokenMessage: response.body.refreshedTokenMessage,
            });
            done();
          })
          .catch((error) => {
            done(error); // Chiamata a done con l'errore in caso di fallimento del test
          });
      });
    });

    test("GetGroup - Unauthorized", (done) => {
      Group.create(group).then(() => {
        request(app)
          .get(`/api/groups/${group.name}`)
          .send({ name: group.name })
          .then((response) => {
            expect(response.status).toBe(401);
            expect(response.body).toEqual({
              error: expect.stringMatching(/Unauthorized/),
            });
            done();
          })
          .catch((error) => {
            done(error); // Chiamata a done con l'errore in caso di fallimento del test
          });
      });
    });
  });

  describe("User", () => {
    beforeEach(async () => {
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

      await User.create(user);
    });

    test("GetGroup - Success", (done) => {
      Group.create(group).then(() => {
        request(app)
          .get(`/api/groups/${group.name}`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .send({ name: group.name })
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
              data: expect.objectContaining({
                name: "GroupName",
                members: expect.arrayContaining([
                  expect.objectContaining({ email: user.email }),
                  expect.objectContaining({ email: "user1@email.com" }),
                ]),
              }),
              refreshedTokenMessage: response.body.refreshedTokenMessage,
            }),
              done();
          });
      });
    });

    test("GetGroup - User not found", (done) => {
      User.deleteMany({}).then(() => {
        Group.create(group).then(() => {
          request(app)
            .get(`/api/groups/${group.name}`)
            .set("Cookie", [
              `accessToken=${accessToken}`,
              `refreshToken=${refreshToken}`,
            ])
            .send({ name: group.name })
            .then((response) => {
              expect(response.status).toBe(400);
              expect(response.body).toEqual({
                error: expect.stringMatching(/User not found/),
                refreshedTokenMessage: response.body.refreshedTokenMessage,
              }),
                done();
            });
        });
      });
    });

    test("GetGroup - User not in group", (done) => {
      group.members = [];

      Group.create(group).then(() => {
        request(app)
          .get(`/api/groups/${group.name}`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .send({ name: group.name })
          .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
              error: expect.stringMatching(/User not in the specified group/),
              refreshedTokenMessage: response.body.refreshedTokenMessage,
            }),
              done();
          });
      });
    });
  });
});

describe("addToGroup", () => {
  let admin, user, group;
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    admin = {
      username: "admin",
      email: "admin@email.com",
      password: "admin",
      role: "Admin",
    };

    group = {
      name: "GroupName",
      members: [{ email: "user@email.com", id: "1" }],
    };

    user = {
      username: "user",
      email: "user@email.com",
      password: "user",
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

    admin.refreshToken = refreshToken;

    await User.create(admin, user);
    await Group.create(group);
  });

  test("AddToGroup - Success", (done) => {
    let user1 = {
      username: "user1",
      email: "user1@email.com",
      password: "user1",
      role: "Regular",
    };

    let user2 = {
      username: "user2",
      email: "user2@email.com",
      password: "user2",
      role: "Regular",
    };

    User.create(user1, user2).then(() => {
      request(app)
        .patch(`/api/groups/${group.name}/add`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: group.name,
          emails: ["user1@email.com", "user2@email.com"],
        })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: expect.objectContaining({
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
            }),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        });
    });
  });

  test("AddToGroup - Group does not exist", (done) => {
    Group.deleteMany({}).then(() => {
      request(app)
        .patch(`/api/groups/${group.name}/add`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: group.name,
          emails: ["user1@email.com", "user2@email.com"],
        })
        .then((response) => {
          // Verifica lo stato della risposta
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/Group does not exist/),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        });
    });
  });

  test("AddToGroup - No emails provided", (done) => {
    request(app)
      .patch(`/api/groups/${group.name}/add`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({
        name: group.name,
        emails: [],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(/No emails provided/),
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        });
        done();
      });
  });

  test("AddToGroup - Users does not exists", (done) => {
    request(app)
      .patch(`/api/groups/${group.name}/add`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({
        name: group.name,
        emails: ["user1@email.com", "user2@email.com"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: `The specified user1@email.com,user2@email.com users either do not exist or are already in a group`,
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        });
        done();
      });
  });
});

describe("removeFromGroup", () => {
  let admin, user, group;
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    admin = {
      username: "admin",
      email: "admin@email.com",
      password: "admin",
      role: "Admin",
    };

    group = {
      name: "GroupName",
      members: [
        { email: "user@email.com", id: "1" },
        {
          email: "user1@email.com",
          id: "2",
        },
      ],
    };

    user = {
      username: "user",
      email: "user@email.com",
      password: "user",
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

    admin.refreshToken = refreshToken;

    await User.create(admin, user);
    await Group.create(group);
  });

  test("RemoveFromGroup - Success", (done) => {
    let user1 = {
      username: "user1",
      email: "user1@email.com",
      password: "user1",
      role: "Regular",
    };

    User.create(user1).then(() => {
      request(app)
        .patch(`/api/groups/${group.name}/remove`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: group.name,
          emails: ["user1@email.com"],
        })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: expect.objectContaining({
              group: expect.objectContaining({
                name: "GroupName",
                members: expect.arrayContaining([
                  expect.objectContaining({ email: user.email }),
                ]),
              }),
              notInGroup: [],
              membersNotFound: [],
            }),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        });
    });
  });

  test("RemoveFromGroup - Group does not exist", (done) => {
    Group.deleteMany({}).then(() => {
      request(app)
        .patch(`/api/groups/${group.name}/remove`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({
          name: group.name,
          emails: ["user1@email.com"],
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/Group does not exist/),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        });
    });
  });

  test("RemoveFromGroup - No emails provided", (done) => {
    request(app)
      .patch(`/api/groups/${group.name}/remove`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({
        name: group.name,
        emails: [],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(/No emails provided/),
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        });
        done();
      });
  });

  test("RemoveFromGroup - Cannot remove all members", (done) => {
    let user1 = {
      username: "user1",
      email: "user1@email.com",
      password: "user1",
      role: "Regular",
    };

    group.members = [{ email: "user@email.com", id: "1" }];

    Group.deleteMany({}).then(() => {
      Group.create(group).then(() => {
        User.create(user1).then(() => {
          request(app)
            .patch(`/api/groups/${group.name}/remove`)
            .set("Cookie", [
              `accessToken=${accessToken}`,
              `refreshToken=${refreshToken}`,
            ])
            .send({
              name: group.name,
              emails: ["user1@email.com"],
            })
            .then((response) => {
              expect(response.status).toBe(400);
              expect(response.body).toEqual({
                error: expect.stringMatching(
                  /You cannot remove all the members from a group/
                ),
                refreshedTokenMessage: response.body.refreshedTokenMessage,
              });
              done();
            });
        });
      });
    });
  });

  test("RemoveFromGroup - Not existing user", (done) => {
    request(app)
      .patch(`/api/groups/${group.name}/remove`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({
        name: group.name,
        emails: ["user1@email.com"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(/Invalid or non-existing emails/),
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        });
        done();
      });
  });
});

describe("deleteUser", () => {
  let admin, user, group;
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    admin = {
      username: "admin",
      email: "admin@email.com",
      password: "admin",
      role: "Admin",
    };

    user = {
      username: "user",
      email: "user@email.com",
      password: "user",
      role: "Regular",
    };

    group = {
      name: "GroupName",
      members: [
        { email: "user@email.com", id: "1" },
        { email: "user1@email.com", id: "2" },
      ],
    };

    await User.create(admin, user);
    await Group.create(group);

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

  test("DeleteUser - Success", (done) => {
    request(app)
      .delete(`/api/users`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({ email: user.email })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          data: {
            deletedTransactions: expect.any(Number),
            deletedFromGroup: expect.any(Boolean),
          },
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        }),
          done();
      });
  });

  test("DeleteUser - Unauthorized", (done) => {
    request(app)
      .delete(`/api/users`)
      .send({ email: user.email })
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: expect.stringMatching(/Unauthorized/),
        }),
          done();
      });
  });

  test("DeleteUser - No email provided", (done) => {
    request(app)
      .delete(`/api/users`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(/No email provided/),
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        }),
          done();
      });
  });

  test("DeleteUser - Invalid email format", (done) => {
    user.email = "invalidEmail";

    User.deleteMany({}).then(() => {
      User.create(user).then(() => {
        request(app)
          .delete(`/api/users`)
          .set("Cookie", [
            `accessToken=${accessToken}`,
            `refreshToken=${refreshToken}`,
          ])
          .send({ email: user.email })
          .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
              error: expect.stringMatching(/Invalid email format/),
              refreshedTokenMessage: response.body.refreshedTokenMessage,
            }),
              done();
          });
      });
    });
  });

  test("DeleteUser - User doesn't exist ", (done) => {
    User.deleteMany({}).then(() => {
      request(app)
        .delete(`/api/users`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ email: user.email })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/The user doesn't exist/),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          }),
            done();
        });
    });
  });

  test("DeleteUser - Can't delete an admin", (done) => {
    request(app)
      .delete(`/api/users`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({ email: admin.email })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(/You can't delete an admin/),
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        }),
          done();
      });
  });
});

describe("deleteGroup", () => {
  let admin;

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    admin = {
      username: "admin",
      email: "admin@email.com",
      password: "admin",
      role: "Admin",
    };

    accessToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },

      "EZWALLET",
      { expiresIn: "1h" }
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

  test("DeleteGroup - Success", (done) => {
    let group = {
      name: "GroupName",
      members: [],
    };

    Group.create(group).then(() => {
      request(app)
        .delete(`/api/groups`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({ name: group.name })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: {
              message: expect.stringMatching(
                `Group ${group.name} cancelled with success!`
              ),
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

  test("DeleteGroup - No Group name provided", (done) => {
    let group = {
      name: "GroupName",
      members: [],
    };

    Group.create(group).then(() => {
      request(app)
        .delete(`/api/groups`)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expect.stringMatching(/No group name provided/),
            refreshedTokenMessage: response.body.refreshedTokenMessage,
          });
          done();
        })
        .catch((error) => {
          done(error); // Chiamata a done con l'errore in caso di fallimento del test
        });
    });
  });

  test("DeleteGroup - No Group name provided", (done) => {
    let group = {
      name: "GroupName",
      members: [],
    };

    request(app)
      .delete(`/api/groups`)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .send({ name: group.name })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: expect.stringMatching(
            `The group ${group.name} doesn't exist!`
          ),
          refreshedTokenMessage: response.body.refreshedTokenMessage,
        });
        done();
      })
      .catch((error) => {
        done(error); // Chiamata a done con l'errore in caso di fallimento del test
      });
  });
});
