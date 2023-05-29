import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import createTransaction from "../controllers/controller";
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

describe("createCategory", () => {
/**How can I handle the authentication part by the Admin User? */
  let user, accessToken, refreshToken;
  beforeAll(async ()=>{
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
  })
  beforeEach(async ()=>{
    await categories.deleteMany({});
  });
  test("New category inserted", (done) => {
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
      .then((response)=>{
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

  test("Not enough attributes", (done) => {
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
      .then((response)=>{
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`Missing`),
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Type attributes is empty ", (done) => {
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
      .then((response)=>{
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`empty`),
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Category already exist", (done) => {
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
        .then((response)=>{
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
  
  test("Not an Admin", (done) => {
    const category = {
      type: "TestType",
      color: "TestColor",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .then((response)=>{
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
          expect(response.body).toEqual({
            error: expect.stringContaining(`Unauthorized`),
          });
          done();
      })
      .catch((err) => done(err));
  });
});

describe("updateCategory", () => {
  beforeAll(async () =>{
    const standardValue ={
      type:"TestType",
      color:"TestColor",
    }
    await categories.deleteMany({});
    await categories.create(standardValue);
  });

  test("Category update - Success", (done) => {
    const newValue ={
      type:"NewType",
      color: "NewColor",
    }

    request(app)
      .patch("api/categories/:type")
      .send(newValue)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("updated to");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));

  });

  test("Category update - Category doesn't exist", (done) => {
    const newValue ={
      type:"NewType",
      color: "NewColor",
    }

    request(app)
      .patch("api/categories/:type")
      .send(newValue)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("updated to");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));
  });
  
  test("Category update - Invalid Values", (done) => {
    const newValue ={
      type:"NewType",
      color: "NewColor",
    }

    request(app)
      .patch("api/categories/:type")
      .send(newValue)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("updated to");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));
  });
  
  test("Category update - Not an Admin", (done) => {
    const newValue ={
      type:"NewType",
      color: "NewColor",
    }

    request(app)
      .patch("api/categories/:type")
      .send(newValue)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("updated to");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));
  });

});

describe("deleteCategory", () => {
  beforeEach(async () => {
    const category1 ={
      type:"NewType1",
      color: "NewColor1",
    }
    const category2 ={
      type:"NewType2",
      color: "NewColor2",
    }
    const category3 ={
      type:"NewType3",
      color: "NewColor3",
    }
    const category4 ={
      type:"NewType4",
      color: "NewColor4",
    }
    const category5 ={
      type:"NewType5",
      color: "NewColor5",
    }
    await categories.deleteMany({});
    await categories.insertMany([category1, category2, category3, category4, category5]);
  });

  test("Delete Category - Delete 1", (done) => {
    const categoryToBeDeleted =[{type:"NewType1"}];

    request(app)
      .delete("api/categories")
      .send(categoryToBeDeleted)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("successfully deleted");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Category - Delete Many", (done) => {
    const categoryToBeDeleted =[{type:"NewType1"},{type:"NewType2"},{type:"NewType3"}];

    request(app)
      .delete("api/categories")
      .send(categoryToBeDeleted)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("successfully deleted");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));
  });
/**Need to do the error test */
  test("Delete Category - r", (done) => {
    const categoryToBeDeleted =[{type:"NewType1"},{type:"NewType2"},{type:"NewType3"}];

    request(app)
      .delete("api/categories")
      .send(categoryToBeDeleted)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.data.message).toContain("successfully deleted");
        expect(response.body.data).toHaveProperty("count");
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);
        done();
      })
      .catch((err) => done(err));
  });

  test("Delete Category - Not an Admin", (done) => {
    const newValue ={
      type:"NewType",
    }

    request(app)
      .get("api/categories")
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.error).toContain("unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("getCategories", () => {

  beforeAll(async () => {
    await categories.deleteMany({});

    const category1 ={
      type:"NewType1",
      color: "NewColor1",
    }
    const category2 ={
      type:"NewType2",
      color: "NewColor2",
    }
    const category3 ={
      type:"NewType3",
      color: "NewColor3",
    }
    const category4 ={
      type:"NewType4",
      color: "NewColor4",
    }
    const category5 ={
      type:"NewType5",
      color: "NewColor5",
    }
    
    await categories.insertMany([category1, category2, category3, category4, category5]);
  });
  test("Success !", (done) => {
    request(app)
      .get("api/categories")
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toBeInstanceOf(categories);
        done();
      })
      .catch((err) => done(err));
  });

  test("User not Authenticated", (done) => {
    request(app)
      .get("api/categories/")
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.error).toContain("unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("createTransaction", () => {
  
  beforeEach(async()=>{
    await transactions.deleteMany({});
  });
  test("Transaction created", (done) => {
    request(app)
      .post("api/users/:username/transaction")
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.error).toContain("unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("getAllTransactions", () => {
  beforeEach(async ()=>{
    await transactions.deleteMany({});
  })

  test("Get All Transaction ", async (done) => {
    const today = dayjs();

    const transaction1 = {
      username: "User1",
      type: "Type1",
      amount: 100,
      date: today,
    }
    const transaction2 = {
      username: "Admin",
      type: "Type2",
      amount: 3,
      date: today,
    }
    const transaction3 = {
      username: "User2",
      type: "Type1",
      amount: 17,
      date: today,
    }
    
    await transactions.insertMany([transaction1, transaction2, transaction3]);

    request(app)
      .get("api/transactions")
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toContain("username");
        expect(response.body.data[0]).toContain("type");
        expect(response.body.data[0]).toContain("amount");
        expect(response.body.data[0]).toContain("date");
        expect(response.body.data[0]).toContain("color");
        done();
      })
      .catch((err) => done(err));
  });

  test("Get All Transaction - No Transaction", (done) => {
    request(app)
      .get("api/transactions")
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("error");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toBeDefined();
        expect(response.body.data[0]).toBeFalsy();
        done();
      })
      .catch((err) => done(err));
  });

  test("Get All Transaction - Not an Admin", (done) => {
    request(app)
      .get("api/transactions")
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.error).toContain("unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("getTransactionsByUser", () => {
  beforeAll(async ()=>{
    await transactions.deleteMany({});
  });
  beforeEach(async () => {
    const today = "04-03-2020";

    const transaction1 = {
      username: "User1",
      type: "Type1",
      amount: 100,
      date: today,
    }
    const transaction2 = {
      username: "Admin",
      type: "Type2",
      amount: 3,
      date: today,
    }
    const transaction3 = {
      username: "User2",
      type: "Type1",
      amount: 17,
      date: today,
    }
    const transaction4 = {
      username: "User1",
      type: "Type3",
      amount: 50,
      date: today,
    }

    await transactions.insertMany([transaction1, transaction2, transaction3, transaction4]);
  });
  
  test("Get Transaction By User1", (done) => {
    const username = "User1";

    request(app)
      .get("api/users/:username/transactions".replace(":username",username))
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toContain("username");
        expect(response.body.data[0]).toContain("type");
        expect(response.body.data[0]).toContain("amount");
        expect(response.body.data[0]).toContain("date");
        expect(response.body.data[0]).toContain("color");
        done();
      })
      .catch((err) => done(err));
  });
  test("User not Consistent", (done) => {
    /**Username have to consistent with the logged in user */
    request(app)
      .get("api/users/:username/transactions")
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.error).toContain("unauthorized");
        done();
      })
      .catch((err) => done(err));
  });

  test("Get All Transaction - Not an Admin", (done) => {
    request(app)
      .get("api/transactions/users/:username")
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.data).toHaveProperty("message");
        expect(response.body.error).toContain("unauthorized");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("getTransactionsByUserByCategory", () => {
  beforeAll(async()=>{});
  beforeEach(async()=>{});
  afterAll(async()=>{});
  afterEach(async()=>{});

  test("Success !", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
  test("Username not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Category not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Username not consistent with the User", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test(" Not an Admin", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
});

describe("getTransactionsByGroup", () => {
  test("Success !", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
  test("Username not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Category not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Username not consistent with the User", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test(" Not an Admin", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
});

describe("getTransactionsByGroupByCategory", () => {
  test("Success !", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
  test("Username not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Category not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Username not consistent with the User", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test(" Not an Admin", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
});

describe("deleteTransaction", () => {
  test("Success !", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
  test("Username not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Category not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Username not consistent with the User", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test(" Not an Admin", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
});

describe("deleteTransactions", () => {
  test("Success !", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
  test("Username not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Category not in the database", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test("Username not consistent with the User", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });

  test(" Not an Admin", (done) => {
    request(app)
      .get("")
      .send()
      .then((response) => {
        expect();
        done();
      })
      .catch((err) => done(err));
  });
});
