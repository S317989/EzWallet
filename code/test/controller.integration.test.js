import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import createTransaction from "../controllers/controller";
import dayjs from "dayjs";

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

  beforeEach(async ()=>{
    /*const Admin ={
      username:"Admin",
      email:"AdminAdmin@controller.com",
      password:"Admin1",
      role: "Admin",
    }
    await User.create(Admin);*/

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
    const category1 = {
      type: "TestType",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .then((response)=>{
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`is missing`),
        });
        done();
      })
      .catch((err) => done(err));
  });
  test("Not enough attributes", (done) => {
    const category = {
      color: "TestColor",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .then((response)=>{
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`is missing`),
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
      .send(category1)
      .then((response)=>{
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`is empty`),
        });
        done();
      })
      .catch((err) => done(err));
  });
  
  test("Color attributes is empty ", (done) => {
    const category = {
      type: "TestType",
      color: "",
    };

    request(app)
      .post("/api/categories")
      .send(category2)
      .then((response)=>{
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toEqual({
          error: expect.stringContaining(`is empty`),
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
  
  test("User not Authorized", (done) => {
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
            error: expect.stringContaining(`unauthorized`),
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

  test("Category update - Success", () => {
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

  test("Category update - Category doesn't exist", () => {
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
  
  test("Category update - Invalid Values", () => {
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
  
  test("Category update - Not an Admin", () => {
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

  test("Delete Category - Delete 1", () => {
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

  test("Delete Category - Delete Many", () => {
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
  test("Delete Category - r", () => {
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

  test("Delete Category - Not an Admin", () => {
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
  test("Get Category - Succesfully", () => {
    request(app)
      .get("api/categories")
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).not.toBeFalsy();
        done();
      })
      .catch((err) => done(err));
  });

  test("Get Category - Not an Admin", () => {
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
  test("Transaction created", () => {
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
  
  test("Get All Transaction ", async () => {
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

  test("Get All Transaction - No Transaction", () => {
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

  test("Get All Transaction - Not an Admin", () => {
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
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("getTransactionsByUserByCategory", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("getTransactionsByGroup", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("getTransactionsByGroupByCategory", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("deleteTransaction", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("deleteTransactions", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});
