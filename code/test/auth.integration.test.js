import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
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
});

describe("registerAdmin", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
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
