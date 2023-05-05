import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { register } from "../controllers/auth";
const bcrypt = require("bcryptjs");

jest.mock("bcryptjs");
jest.mock("../models/User.js");

describe("register", () => {
  test("Registration Done", async () => {
    const newUser = {
      username: "test",
      email: "test@test.com",
      password: "test",
    };

    const mockRequest = { body: newUser };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith("user added succesfully");
  });

  test("Registration Fails for user already existing", async () => {
    // Create an existing user
    const existingUser = {
      username: "Prova1",
      email: "Prova1",
      password: "Prova1",
    };

    // Mock the User.findOne method to return a mock user object
    User.findOne.mockResolvedValueOnce(existingUser);

    const mockRequest = { body: existingUser };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "you are already registered",
    });
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
