import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import { categories, transactions } from "../models/model.js";
import { verifyAuth } from "../controllers/utils";
import { getUser, getusers, createGroup } from "../controllers/users";
import { Group } from "../models/User.js";
import {user} from "../models/User"

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js");

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  User.find.mockClear();
  //additional `mockClear()` must be placed here
});

describe("getUsers", () => {

  const controller = require("../controllers/utils");
   test("should return empty list if there are no users", async () => {
    const mockRequest = {};
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const verify = {authorized: true, message: "Authorized"}
    jest.spyOn(controller,"verifyAuth").mockImplementation(verify);
    // Mock the User.find() method to return an empty array
    jest.spyOn(User, "find").mockResolvedValue([]);
  
    // Call the verifyAuth function from the controller module
    const response  = await request(app).get('/api/users').send();
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
})
  

describe("getUser", () => {});

describe("createGroup", () => {});

describe("getGroups", () => {});

describe("getGroup", () => {});

describe("addToGroup", () => {});

describe("removeFromGroup", () => {});

describe("deleteUser", () => {});

describe("deleteGroup", () => {});