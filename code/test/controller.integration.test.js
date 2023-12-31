import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import { Group, User } from "../models/User";
const jwt = require("jsonwebtoken");

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseController";
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

beforeEach(async () => {
  await categories.deleteMany({});
  await transactions.deleteMany({});
  await User.deleteMany({});
  await Group.deleteMany({});
});

describe("createCategory", () => {
  let admin, accessToken, refreshToken;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
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
    admin.refreshToken = refreshToken;

    await User.create(admin);
  });

  afterEach(async () => {
    await categories.deleteMany({});
  });

  test("Create Category - Success", (done) => {
    const category = {
      type: "TestType",
      color: "TestColor",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("type");
        expect(response.body.data.type).toEqual("TestType");
        expect(response.body.data).toHaveProperty("color");
        expect(response.body.data.color).toEqual("TestColor");
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Category - Not enough attributes", (done) => {
    const category = {
      type: "TestType",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`Missing`),
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Catetgory - Type attributes is empty ", (done) => {
    const category = {
      type: "",
      color: "TestColor",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`empty`),
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Catetgory - Category already exist", (done) => {
    const category = {
      type: "TestType",
      color: "TestColor",
    };

    categories.create(category).then(() => {
      request(app)
        .post("/api/categories")
        .send(category)
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("error");
          expect(response.body).toEqual({
            error: expect.stringContaining(`already exist`),
          });
          done();
        })
        .catch((err) => done(err));
    });
  });

  test("Create Catetgory - Not an Admin", (done) => {
    const category = {
      type: "TestType",
      color: "TestColor",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`Unauthorized`),
        });
        done();
      })
      .catch((err) => done(err));
  });
}); /** 5/5 test */

describe("updateCategory", () => {
  let admin, Admin_accessToken, Admin_refreshToken;
  let user, User_accessToken, User_refreshToken;

  const standardValue = {
    type: "TestType",
    color: "TestColor",
  };

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user = {
      username: "TestUser",
      email: "user@test.com",
      password: "TestUser",
      role: "Regular",
    };
    User_accessToken = jwt.sign(
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
    User_refreshToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user.refreshToken = User_refreshToken;
    await User.insertMany([admin, user]);

    await categories.create(standardValue);
  });

  afterEach(async () => {
    await categories.deleteMany({});
  });

  test("Update Category - Success", (done) => {
    const newValue = {
      type: "NewType",
      color: "NewColor",
    };

    request(app)
      .patch("/api/categories/:type".replace(":type", standardValue.type))
      .send(newValue)
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("successfully");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));
  });

  test("Update Category - Invalid Parameters", (done) => {
    const newValue = {
      type: "NewType",
    };

    request(app)
      .patch("/api/categories/:type".replace(":type", standardValue.type))
      .send(newValue)
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Missing");
        done();
      })
      .catch((err) => done(err));
  });

  test("Update Category - Empty Parameters", (done) => {
    const newValue = {
      type: "",
      color: "NewColor",
    };

    request(app)
      .patch("/api/categories/:type".replace(":type", standardValue.type))
      .send(newValue)
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("empty");
        done();
      })
      .catch((err) => done(err));
  });

  test("Update Category - Category doesn't exist", (done) => {
    const newValue = {
      type: "NewType",
      color: "NewColor",
    };

    request(app)
      .patch("/api/categories/:type".replace(":type", "Type"))
      .send(newValue)
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("doesn't exists");
        done();
      })
      .catch((err) => done(err));
  });

  test("Update Category - New Category already exist", (done) => {
    const newValue = {
      type: "NewType",
      color: "NewColor",
    };

    categories.create(newValue).then(() => {
      request(app)
        .patch("/api/categories/:type".replace(":type", standardValue.type))
        .send(newValue)
        .set("Cookie", [
          `accessToken=${Admin_accessToken}`,
          `refreshToken=${Admin_refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("error");
          expect(response.body.error).toContain("already exists");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test("Update Category - Not an Admin", (done) => {
    const newValue = {
      type: "NewType",
      color: "NewColor",
    };

    request(app)
      .patch("/api/categories/:type".replace(":type", standardValue.type))
      .send(newValue)
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
}); /** 6/6 test */

describe("deleteCategory", () => {
  let admin, Admin_accessToken, Admin_refreshToken;
  let user, User_accessToken, User_refreshToken;
  let category1, category2, category3, category4;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };

    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user = {
      username: "TestUser",
      email: "user@test.com",
      password: "TestUser",
      role: "Regular",
    };
    User_accessToken = jwt.sign(
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
    User_refreshToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user.refreshToken = User_refreshToken;
    await User.insertMany([admin, user]);

    category1 = {
      type: "NewType1",
      color: "NewColor1",
    };
    category2 = {
      type: "NewType2",
      color: "NewColor2",
    };
    category3 = {
      type: "NewType3",
      color: "NewColor3",
    };
    category4 = {
      type: "NewType4",
      color: "NewColor4",
    };
    await categories.insertMany([category1, category2, category3, category4]);
  });

  afterEach(async () => {
    await categories.deleteMany({});
  });

  test("Delete Category - Delete 1 - Success", (done) => {
    const categoryToBeDeleted = [category1.type];

    transactions
      .insertMany([
        {
          username: admin.username,
          type: category1.type,
          amount: 10,
        },
        {
          username: admin.username,
          type: category1.type,
          amount: 20,
        },
      ])
      .then(() => {
        request(app)
          .delete("/api/categories")
          .send({
            types: categoryToBeDeleted,
          })
          .set("Cookie", [
            `accessToken=${Admin_accessToken}`,
            `refreshToken=${Admin_refreshToken}`,
          ])
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("message");
            expect(response.body.data.message).toMatch("deleted");
            expect(response.body.data).toHaveProperty("count");
            expect(response.body.data.count).toBe(2);
            done();
          })
          .catch((err) => done(err));
      });
  });

  test("Delete Category - Delete Many - Success", (done) => {
    const categoryToBeDeleted = [category1.type, category2.type];

    transactions
      .insertMany([
        {
          username: admin.username,
          type: category1.type,
          amount: 20,
        },
        {
          username: admin.username,
          type: category2.type,
          amount: 20,
        },
        {
          username: user.username,
          type: category3.type,
          amount: 20.56,
        },
      ])
      .then(() => {
        request(app)
          .delete("/api/categories")
          .send({
            types: categoryToBeDeleted,
          })
          .set("Cookie", [
            `accessToken=${Admin_accessToken}`,
            `refreshToken=${Admin_refreshToken}`,
          ])
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("message");
            expect(response.body.data.message).toMatch("Categories");
            expect(response.body.data).toHaveProperty("count");
            expect(response.body.data.count).toBe(2);
            done();
          })
          .catch((err) => done(err));
      });
  });

  test("Delete Category - Only 1 category in the DB", (done) => {
    const categoryToBeDeleted = [category1.type];

    categories
      .deleteMany({
        $or: [
          {
            type: category2.type,
          },
          {
            type: category3.type,
          },
          {
            type: category4.type,
          },
        ],
      })
      .then(async () => {
        request(app)
          .delete("/api/categories")
          .send({
            types: categoryToBeDeleted,
          })
          .set("Cookie", [
            `accessToken=${Admin_accessToken}`,
            `refreshToken=${Admin_refreshToken}`,
          ])
          .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toMatch("No categories can be deleted");
            done();
          })
          .catch((err) => done(err));
      });
  });

  test("Delete Category - At least 1 category type is empty in the input array", (done) => {
    const categoryToBeDeleted = ["", "NewType2", "NewType3"];

    request(app)
      .delete("/api/categories")
      .send({
        types: categoryToBeDeleted,
      })
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch("Empty string");
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Category - At least 1 category is not in the DB", (done) => {
    const categoryToBeDeleted = ["Type", "NewType2", "NewType3"];

    request(app)
      .delete("/api/categories")
      .send(categoryToBeDeleted)
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch("Missing");
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Category - Body doesn't contain all attributes", (done) => {
    request(app)
      .delete("/api/categories")
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch("Missing");
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Category - Not Authenticated", (done) => {
    const categoryToBeDeleted = ["NewType1", "NewType2", "NewType3"];

    request(app)
      .delete("/api/categories")
      .send({
        types: categoryToBeDeleted,
      })
      .set("Cookie", [])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Category - Regular User Authenticated, not Admin", (done) => {
    const categoryToBeDeleted = [
      category1.type,
      category2.type,
      category3.type,
    ];

    request(app)
      .delete("/api/categories")
      .send({
        types: categoryToBeDeleted,
      })
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
}); /** 8/8 test */

describe("getCategories", () => {
  let user, accessToken, refreshToken;
  let category1, category2, category3, category4, category5;

  beforeAll(async () => {
    user = {
      username: "TestUser",
      email: "user@test.com",
      password: "TestUser",
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
  });

  beforeEach(async () => {
    await categories.deleteMany({});
    category1 = {
      type: "NewType1",
      color: "NewColor1",
    };
    category2 = {
      type: "NewType2",
      color: "NewColor2",
    };
    category3 = {
      type: "NewType3",
      color: "NewColor3",
    };
    category4 = {
      type: "NewType4",
      color: "NewColor4",
    };

    await categories.insertMany([category1, category2, category3, category4]);
  });

  test("Get Categories - Success", (done) => {
    request(app)
      .get("/api/categories")
      .send()
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  });

  test("Get Categories - User not Authenticated", (done) => {
    request(app)
      .get("/api/categories/")
      .send()
      .set("Cookie", [])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/Unauthorized/);
        done();
      })
      .catch((err) => done(err));
  });
}); /** 2/2 test */

describe("createTransaction", () => {
  let user, accessToken, refreshToken;
  let category;

  beforeEach(async () => {
    user = {
      username: "TestUser1",
      email: "user1@test.com",
      password: "TestUser1",
      role: "Regular",
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
    await User.insertMany([user]);

    category = {
      type: "Type",
      color: "Color",
    };
    await categories.insertMany([category]);

    await transactions.deleteMany({});
  });

  afterEach(async () => {
    await transactions.deleteMany({});
  });

  test("Create Transaction - Success", (done) => {
    const newTransaction = {
      username: user.username,
      type: category.type,
      amount: 20,
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(
          ":username",
          newTransaction.username
        )
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("username");
        expect(response.body.data.username).not.toBeNull();
        expect(response.body.data).toHaveProperty("amount");
        expect(response.body.data.amout).not.toBeNaN();
        expect(response.body.data).toHaveProperty("type");
        expect(response.body.data.type).not.toBeNull();
        expect(response.body.data).toHaveProperty("date");
        expect(response.body.data.date).not.toBeNull();
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Transaction - Missing attributes", (done) => {
    const newTransaction = {
      type: category.type,
      amount: 20,
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(
          ":username",
          newTransaction.username
        )
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/Missing/);
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Transaction - Empty body attributes", (done) => {
    const newTransaction = {
      username: "",
      type: category.type,
      amount: "",
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(":username", user.username)
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/empty/);
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Transaction - Category doesn't exist in the DB", (done) => {
    const newTransaction = {
      username: user.username,
      type: "OtherType",
      amount: 20,
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(
          ":username",
          newTransaction.username
        )
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch("doesn't exist");
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Transaction - Route Username doesn't match the request body", (done) => {
    const newTransaction = {
      username: "User",
      type: category.type,
      amount: 20,
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(":username", user.username)
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/Username/);
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Transaction - Route Username is not in the DB", (done) => {
    const newTransaction = {
      username: user.username,
      type: category.type,
      amount: 20,
    };

    request(app)
      .post("/api/users/:username/transactions".replace(":username", "User"))
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/Username/);
        done();
      })
      .catch((err) => done(err));
  });

  //Need to implement (in the method) a specific check for this error !!
  test("Create Transaction - Body Username is not in the DB", (done) => {
    const newTransaction = {
      username: "User",
      type: category.type,
      amount: 20,
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(":username", user.username)
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/Username/);
        done();
      })
      .catch((err) => done(err));
  });

  test("Create Transaction - Amount is not a float", (done) => {
    const newTransaction = {
      username: user.username,
      type: category.type,
      amount: "alpha",
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(
          ":username",
          newTransaction.username
        )
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${accessToken}`,
        `refreshToken=${refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/not a number/);
        done();
      })
      .catch((err) => done(err));
  });

  //Need to implement (in the method) a specific check for this error !!
  test("Create Transaction - Authenticated user doesn't match the user in body", (done) => {
    const newTransaction = {
      username: user.username,
      type: category.type,
      amount: 20,
    };

    const generalUser = {
      username: "GeneralUser",
      email: "generalUser@test.com",
      password: "GeneralUser",
    };

    request(app)
      .post(
        "/api/users/:username/transactions".replace(
          ":username",
          newTransaction.username
        )
      )
      .send(newTransaction)
      .set("Cookie", [
        `accessToken=${jwt.sign(
          {
            username: generalUser.username,
            email: generalUser.email,
            password: generalUser.password,
            role: "Admin",
          },
          "EZWALLET",
          {
            expiresIn: "1h",
          }
        )}`,
        `Admin_refreshToken=${jwt.sign(
          {
            username: generalUser.username,
            email: generalUser.email,
            password: generalUser.password,
            role: "Admin",
          },
          "EZWALLET",
          { expiresIn: "7d" }
        )}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch("Unauthorized");

        done();
      })
      .catch((err) => done(err));
  });
}); /** 9/9 test */

describe("getAllTransactions", () => {
  let admin, Admin_accessToken, Admin_refreshToken;
  let user, User_accessToken, User_refreshToken;
  let category;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user = {
      username: "TestUser1",
      email: "user1@test.com",
      password: "TestUser1",
      role: "Regular",
    };
    User_accessToken = jwt.sign(
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
    User_refreshToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user.refreshToken = User_refreshToken;
    await User.insertMany([admin, user]);

    category = {
      type: "Type",
      color: "Color",
    };
    await categories.insertMany([category]);

    const Transaction1 = {
      username: admin.username,
      type: category.type,
      amount: 0,
    };
    const Transaction2 = {
      username: admin.username,
      type: category.type,
      amount: 5,
    };
    const Transaction3 = {
      username: admin.username,
      type: category.type,
      amount: 14.5,
    };
    const Transaction4 = {
      username: admin.username,
      type: category.type,
      amount: 7.24,
    };
    await transactions.insertMany([
      Transaction1,
      Transaction2,
      Transaction3,
      Transaction4,
    ]);
  });

  afterEach(async () => {
    await transactions.deleteMany({});
  });
  /*!! ID of the transaction have not to be rethrived !!*/
  test("Get All Transaction - Success ù", (done) => {
    request(app)
      .get("/api/transactions")
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0].username).not.toBeNull();

        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0].type).not.toBeNull();

        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0].amout).not.toBeNaN();

        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0].date).not.toBeNull();

        expect(response.body.data[0]).toHaveProperty("color");
        expect(response.body.data[0].color).not.toBeNull();
        done();
      })
      .catch((err) => done(err));
  });

  test("Get All Transaction - No Transaction in the DB", (done) => {
    transactions.deleteMany({}).then(() => {
      request(app)
        .get("/api/transactions")
        .send()
        .set("Cookie", [
          `accessToken=${Admin_accessToken}`,
          `refreshToken=${Admin_refreshToken}`,
        ])
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toBeInstanceOf(Array);
          expect(response.body.data).toBeDefined();
          expect(response.body.data[0]).toBeFalsy();
          done();
        })
        .catch((err) => done(err));
    });
  });

  test("Get All Transaction - Authenticated Regular User, not an Admin", (done) => {
    request(app)
      .get("/api/transactions")
      .send("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toMatch(/Unauthorized/);
        done();
      })
      .catch((err) => done(err));
  });
}); /** 3/3 test */

describe("getTransactionsByUser", () => {
  let user, User_accessToken, User_refreshToken;
  let admin, Admin_accessToken, Admin_refreshToken;
  let cat1, cat2;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user = {
      username: "TestUser",
      email: "user@test.com",
      password: "TestUser",
      role: "Regular",
    };
    User_accessToken = jwt.sign(
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
    User_refreshToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user.refreshToken = User_refreshToken;

    cat1 = {
      type: "Category1",
      color: "Color1",
    };
    cat2 = {
      type: "Category2",
      color: "Color2",
    };

    const transaction1 = {
      username: user.username,
      type: cat2.type,
      amount: 100,
    };
    const transaction2 = {
      username: admin.username,
      type: cat2.type,
      amount: 3,
    };
    const transaction3 = {
      username: user.username,
      type: cat2.type,
      amount: 17.9,
    };
    const transaction4 = {
      username: user.username,
      type: cat1.type,
      amount: 0.78,
    };

    await User.create(admin, user);
    await categories.create(cat1, cat2);
    await transactions.create(
      transaction1,
      transaction2,
      transaction3,
      transaction4
    );
  });

  test("Get Transaction By User - Regular User - Success !", (done) => {
    request(app)
      .get(
        "/api/users/:username/transactions".replace(":username", user.username)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0].username).toEqual(user.username);
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transaction By User - Admin - Success !", (done) => {
    request(app)
      .get(
        "/api/transactions/users/:username".replace(":username", user.username)
      )
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0].username).toContain(user.username);

        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transaction By User - Admin - Username in params not in the DB", (done) => {
    request(app)
      .get("/api/transactions/users/:username".replace(":username", "User1"))
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transaction By User - Regular User - User authenticated and params doesn't match ", (done) => {
    request(app)
      .get(
        "/api/users/:username/transactions".replace(":username", admin.username)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transaction By User - Regular User - Admin route for an authorized regular user", (done) => {
    request(app)
      .get(
        "/api/transactions/users/:username".replace(":username", admin.username)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  /* test("Get Transaction By User -  - Check for query filter", (done) => {
    
    let username = admin.username;
    
    request(app)
      .get("/api/transactions/users/:username".replace(":username", username))
      .send()
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("unauthorized");
        done();
      })
      .catch((err) => done(err));
  }); //DON'T IF NEEDED !!*/
}); /** 5/5 test */

describe("getTransactionsByUserByCategory", () => {
  let user, User_accessToken, User_refreshToken;
  let admin, Admin_accessToken, Admin_refreshToken;
  let cat1, cat2;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user = {
      username: "TestUser",
      email: "user@test.com",
      password: "TestUser",
      role: "Regular",
    };
    User_accessToken = jwt.sign(
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
    User_refreshToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user.refreshToken = User_refreshToken;

    cat1 = {
      type: "Category1",
      color: "Color1",
    };
    cat2 = {
      type: "Category2",
      color: "Color2",
    };

    const transaction1 = {
      username: user.username,
      type: cat2.type,
      amount: 100,
    };
    const transaction2 = {
      username: admin.username,
      type: cat2.type,
      amount: 3,
    };
    const transaction3 = {
      username: user.username,
      type: cat2.type,
      amount: 17.9,
    };
    const transaction4 = {
      username: user.username,
      type: cat1.type,
      amount: 0.78,
    };
    const transaction5 = {
      username: admin.username,
      type: cat1.type,
      amount: 15.93,
    };

    await categories.insertMany([cat1, cat2]);
    await User.insertMany([admin, user]);
    await transactions.insertMany([
      transaction1,
      transaction2,
      transaction3,
      transaction4,
      transaction5,
    ]);
  });

  test("Get Transactions By User By Category - Regular User - Success !", (done) => {
    request(app)
      .get(
        "/api/users/:username/transactions/category/:category"
          .replace(":username", user.username)
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0].username).toEqual(user.username);
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0].type).toEqual(cat1.type);
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By User By Category - Admin - Success !", (done) => {
    request(app)
      .get(
        "/api/transactions/users/:username/category/:category"
          .replace(":username", admin.username)
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0].username).toEqual(admin.username);
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0].type).toEqual(cat1.type);
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By User By Category - Admin - Username in params not in the DB", (done) => {
    request(app)
      .get(
        "/api/transactions/users/:username/category/:category"
          .replace(":username", "User1")
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By User By Category - Admin - Category in params not in the DB", (done) => {
    request(app)
      .get(
        "/api/transactions/users/:username/category/:category"
          .replace(":username", admin.username)
          .replace(":category", "Category")
      )
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By User By Category - Regular User - User authenticated and params doesn't match", (done) => {
    request(app)
      .get(
        "/api/users/:username/transactions/category/:category"
          .replace(":username", admin.username)
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By User By Category - Regular User - Admin route for an authorized regular user", (done) => {
    request(app)
      .get(
        "/api/transactions/users/:username/category/:category"
          .replace(":username", admin.username)
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User_accessToken}`,
        `refreshToken=${User_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  /*test("Get Transactions By User By Category -  - Check for query filter", (done) => {
    
    request(app)
      .get("/api/transactions/users/:username".replace(":username", admin.username))
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe();
        expect(response.body).toHaveProperty();
        expect(response.body).toContain();
        done();
      })
      .catch((err) => done(err));
  }); // DON'T KNOW IF IT'S NECESSARY*/
}); /** 6/6 test */

describe("getTransactionsByGroup", () => {
  let user1, User1_accessToken, User1_refreshToken;
  let user2, User2_accessToken, User2_refreshToken;
  let admin, Admin_accessToken, Admin_refreshToken;
  let cat1, cat2;
  let group1, group2;
  let transaction1, transaction2, transaction3, transaction4;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user1 = {
      username: "TestUser1",
      email: "user1@test.com",
      password: "TestUser1",
      role: "Regular",
    };
    User1_accessToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );
    User1_refreshToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user1.refreshToken = User1_refreshToken;

    user2 = {
      username: "TestUser2",
      email: "user2@test.com",
      password: "TestUser2",
      role: "Regular",
    };
    User2_accessToken = jwt.sign(
      {
        username: user2.username,
        email: user2.email,
        password: user2.password,
        role: "Regular",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );
    User2_refreshToken = jwt.sign(
      {
        username: user2.username,
        email: user2.email,
        password: user2.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user2.refreshToken = User2_refreshToken;
    await User.insertMany([admin, user1, user2]);

    cat1 = {
      type: "Category1",
      color: "Color1",
    };
    cat2 = {
      type: "Category2",
      color: "Color2",
    };
    await categories.insertMany([cat1, cat2]);

    group1 = {
      name: "Group1",
      members: [
        {
          email: admin.email,
          user: await User.findOne({ username: admin.username }),
        },
        {
          email: user1.email,
          user: await User.findOne({ username: user1.username }),
        },
      ],
    };
    group2 = {
      name: "Group2",
      members: [
        {
          email: user2.email,
          user: await User.findOne({ username: user2.username }),
        },
      ],
    };
    await Group.insertMany([group1, group2]);

    transaction1 = {
      username: user1.username,
      type: cat2.type,
      amount: 100,
    };
    transaction2 = {
      username: admin.username,
      type: cat2.type,
      amount: 3,
    };
    transaction3 = {
      username: user2.username,
      type: cat2.type,
      amount: 17.9,
    };
    transaction4 = {
      username: user2.username,
      type: cat1.type,
      amount: 0.78,
    };
    await transactions.insertMany([
      transaction1,
      transaction2,
      transaction3,
      transaction4,
    ]);
  });

  test("Get Transactions By Group - Regular User - Success !", (done) => {
    request(app)
      .get(`/api/groups/${group1.name}/transactions`)
      .send()
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  });

  test("Get Transactions By Group - Admin - Success !", (done) => {
    request(app)
      .get("/api/transactions/groups/:name".replace(":name", group2.name))
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  });

  test("Get Transaction By Group - Admin - Group in params not in the DB", (done) => {
    request(app)
      .get("/api/transactions/groups/:name".replace(":groups", "Group"))
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transaction By Group - Regular User - Authenticated User not part of the group", (done) => {
    request(app)
      .get("/api/groups/:name/transactions".replace(":groups", group1.name))
      .send()
      .set("Cookie", [
        `accessToken=${User2_accessToken}`,
        `refreshToken=${User2_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Group not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transaction By Group - Regular User - Admin Route for an authenticated Regular User", (done) => {
    request(app)
      .get("/api/transactions/groups/:name".replace(":groups", group2.name))
      .send()
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  }); //PASS
}); /** 5/5 test */

describe("getTransactionsByGroupByCategory", () => {
  let user1, User1_accessToken, User1_refreshToken;
  let user2, User2_accessToken, User2_refreshToken;
  let admin, Admin_accessToken, Admin_refreshToken;
  let cat1, cat2;
  let group1, group2;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user1 = {
      username: "TestUser1",
      email: "user1@test.com",
      password: "TestUser1",
      role: "Regular",
    };
    User1_accessToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );
    User1_refreshToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user1.refreshToken = User1_refreshToken;

    user2 = {
      username: "TestUser2",
      email: "user2@test.com",
      password: "TestUser2",
      role: "Regular",
    };
    User2_accessToken = jwt.sign(
      {
        username: user2.username,
        email: user2.email,
        password: user2.password,
        role: "Regular",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );
    User2_refreshToken = jwt.sign(
      {
        username: user2.username,
        email: user2.email,
        password: user2.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user2.refreshToken = User2_refreshToken;
    await User.insertMany([admin, user1, user2]);

    cat1 = {
      type: "Category1",
      color: "Color1",
    };
    cat2 = {
      type: "Category2",
      color: "Color2",
    };
    await categories.insertMany([cat1, cat2]);

    group1 = {
      name: "Group1",
      members: [
        {
          email: admin.email,
          user: await User.findOne({ username: admin.username }),
        },
        {
          email: user1.email,
          user: await User.findOne({ username: user1.username }),
        },
      ],
    };
    group2 = {
      name: "Group2",
      members: [
        {
          email: user2.email,
          user: await User.findOne({ username: user2.username }),
        },
      ],
    };
    await Group.insertMany([group1, group2]);

    const transaction1 = {
      username: user1.username,
      type: cat2.type,
      amount: 100,
    };
    const transaction2 = {
      username: admin.username,
      type: cat2.type,
      amount: 3,
    };
    const transaction3 = {
      username: user2.username,
      type: cat2.type,
      amount: 17.9,
    };
    const transaction4 = {
      username: user2.username,
      type: cat1.type,
      amount: 0.78,
    };
    await transactions.insertMany([
      transaction1,
      transaction2,
      transaction3,
      transaction4,
    ]);
  });

  test("Get Transactions By Group By Category - Regular User - Success !", (done) => {
    request(app)
      .get(
        "/api/groups/:name/transactions/category/:category"
          .replace(":name", group1.name)
          .replace(":category", cat2.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0].type).toEqual(cat2.type);
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  });

  test("Get Transactions By Group By Category - Admin - Success !", (done) => {
    const groupname = group2.name;
    const category = cat1.type;

    request(app)
      .get(
        "/api/transactions/groups/:name/category/:category"
          .replace(":name", group2.name)
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toHaveProperty("username");
        expect(response.body.data[0]).toHaveProperty("type");
        expect(response.body.data[0].type).toEqual(cat1.type);
        expect(response.body.data[0]).toHaveProperty("amount");
        expect(response.body.data[0]).toHaveProperty("date");
        expect(response.body.data[0]).toHaveProperty("color");
        done();
      })
      .catch((err) => done(err));
  });

  test("Get Transactions By Group By Category - Admin - Group in params not in the DB", (done) => {
    const category = cat1.type;

    request(app)
      .get(
        "/api/transactions/groups/:name/category/:category"
          .replace(":name", "Group")
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By Group By Category - Admin - Category in params not in the DB", (done) => {
    request(app)
      .get(
        "/api/transactions/groups/:name/category/:category"
          .replace(":name", group1.name)
          .replace(":category", "Category")
      )
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Category not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By Group By Category - Regular User - Authenticated User not part of the group", (done) => {
    request(app)
      .get(
        "/api/groups/:name/transactions/category/:category"
          .replace(":groups", group1.name)
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User2_accessToken}`,
        `refreshToken=${User2_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Group not found");
        done();
      })
      .catch((err) => done(err));
  }); //PASS

  test("Get Transactions By Group By Category - Regular User - Admin Route for an authenticated Regular User", (done) => {
    request(app)
      .get(
        "/api/transactions/groups/:name/category/:category"
          .replace(":groups", group2.name)
          .replace(":category", cat1.type)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  }); //PASS
}); /** 6/6 test */

describe("deleteTransaction", () => {
  let user1, User1_accessToken, User1_refreshToken;
  let admin, Admin_accessToken, Admin_refreshToken;
  let cat1, cat2;
  let transaction1, transaction2, transaction3, transaction4;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user1 = {
      username: "TestUser1",
      email: "user1@test.com",
      password: "TestUser1",
      role: "Regular",
    };
    User1_accessToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );
    User1_refreshToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user1.refreshToken = User1_refreshToken;

    cat1 = {
      type: "Category1",
      color: "Color1",
    };
    cat2 = {
      type: "Category2",
      color: "Color2",
    };

    await categories.insertMany([cat1, cat2]);
    await User.insertMany([admin, user1]);

    transaction1 = {
      _id: "646b31fb907572186308033e",
      username: user1.username,
      type: cat2.type,
      amount: 100,
    };
    transaction2 = {
      _id: "646b31fb907572186308033f",
      username: admin.username,
      type: cat2.type,
      amount: 3,
    };
    transaction3 = {
      username: user1.username,
      type: cat2.type,
      amount: 17.9,
    };
    transaction4 = {
      username: user1.username,
      type: cat1.type,
      amount: 0.78,
    };

    await transactions.insertMany([
      transaction1,
      transaction2,
      transaction3,
      transaction4,
    ]);
  });

  test("Delete Transaction - Success !", (done) => {
    const transactionIds = transaction1._id;

    request(app)
      .delete(
        "/api/users/:username/transactions".replace(":username", user1.username)
      )
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .send({ _id: transactionIds })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          data: {
            message: `Transaction ${transactionIds} successfully deleted`,
          },
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transaction - Missing body attributes", (done) => {
    request(app)
      .delete(
        "/api/users/:username/transactions".replace(":username", user1.username)
      )
      .send()
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Missing _ids");
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transaction - Username in params not in the DB", (done) => {
    const transactionIds = transaction1._id;

    User.deleteOne({ username: user1.username }).then(() => {
      request(app)
        .delete("/api/users/User1/transactions")
        .set("Cookie", [
          `accessToken=${User1_accessToken}`,
          `refreshToken=${User1_refreshToken}`,
        ])
        .send({ _id: transactionIds })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("error");
          expect(response.body.error).toContain("User not found");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test("Delete Transaction - Transaction ID, in the body, not in the DB", (done) => {
    const transactionIds = "646b31fb907572186308033d";

    request(app)
      .delete(
        "/api/users/:username/transactions".replace(":username", user1.username)
      )
      .send({
        _id: transactionIds,
      })
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain(
          `Transaction ${transactionIds} not found`
        );
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transaction - The user is not the owner", (done) => {
    const transactionIds = transaction1._id;

    request(app)
      .delete(
        "/api/users/:username/transactions".replace(":username", user1.username)
      )
      .send({
        _id: "646b31fb907572186308033f",
      })
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("The user is not the owner");
        done();
      })
      .catch((err) => done(err));
  });
}); /** 5/5 test */

describe("deleteTransactions", () => {
  let user1, User1_accessToken, User1_refreshToken;
  let admin, Admin_accessToken, Admin_refreshToken;
  let cat1, cat2;
  let transaction1, transaction2, transaction3, transaction4;

  beforeEach(async () => {
    admin = {
      username: "TestAdmin",
      email: "admin@test.com",
      password: "TestAdmin",
      role: "Admin",
    };
    Admin_accessToken = jwt.sign(
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
    Admin_refreshToken = jwt.sign(
      {
        username: admin.username,
        email: admin.email,
        password: admin.password,
        role: "Admin",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    admin.refreshToken = Admin_refreshToken;

    user1 = {
      username: "TestUser1",
      email: "user1@test.com",
      password: "TestUser1",
      role: "Regular",
    };
    User1_accessToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      {
        expiresIn: "1h",
      }
    );
    User1_refreshToken = jwt.sign(
      {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        role: "Regular",
      },
      "EZWALLET",
      { expiresIn: "7d" }
    );
    user1.refreshToken = User1_refreshToken;

    cat1 = {
      type: "Category1",
      color: "Color1",
    };
    cat2 = {
      type: "Category2",
      color: "Color2",
    };

    await categories.insertMany([cat1, cat2]);
    await User.insertMany([admin, user1]);

    transaction1 = {
      _id: "646b31fb907572186308033e",
      username: user1.username,
      type: cat2.type,
      amount: 100,
    };
    transaction2 = {
      _id: "646b31fb907572186308033f",
      username: admin.username,
      type: cat2.type,
      amount: 3,
    };
    transaction3 = {
      username: user1.username,
      type: cat2.type,
      amount: 17.9,
    };
    transaction4 = {
      username: user1.username,
      type: cat1.type,
      amount: 0.78,
    };
    await transactions.insertMany([
      transaction1,
      transaction2,
      transaction3,
      transaction4,
    ]);
  });

  test("Delete Transactions - Delete 1 - Success !", (done) => {
    const transactionIds = [transaction1._id];

    request(app)
      .delete("/api/transactions")
      .send({
        _ids: transactionIds,
      })
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toEqual(
          `Transactions ${transactionIds} successfully deleted`
        );
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transactions - Delete many - Success !", (done) => {
    const transactionIds = [transaction1._id, transaction2._id];

    request(app)
      .delete("/api/transactions")
      .send({
        _ids: transactionIds,
      })
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain(
          `Transactions ${transactionIds} successfully deleted`
        );
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transactions - Missing body attributes", (done) => {
    request(app)
      .delete("/api/transactions")
      .send()
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Missing _ids");
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transactions - 1 attribute is empty", (done) => {
    const transactionIds = [""];

    request(app)
      .delete("/api/transactions")
      .send({
        _ids: transactionIds,
      })
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Empty _ids");
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transactions - Transaction ID in the body not in the DB", (done) => {
    const transactionIds = ["646b31fb907572186308033c"];

    request(app)
      .delete("/api/transactions")
      .send({
        _ids: transactionIds,
      })
      .set("Cookie", [
        `accessToken=${Admin_accessToken}`,
        `refreshToken=${Admin_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain(
          `Transactions [${transactionIds}] don't exist, cannot proceed with deletion`
        );
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Transactions - Not authenticated", (done) => {
    request(app)
      .delete("/api/transactions")
      .send()
      .set("Cookie", [
        `accessToken=${User1_accessToken}`,
        `refreshToken=${User1_refreshToken}`,
      ])
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
}); /** 6/6 test */
