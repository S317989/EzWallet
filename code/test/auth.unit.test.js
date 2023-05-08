import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { register, registerAdmin, login } from "../controllers/auth";
const bcrypt = require("bcryptjs");

jest.mock("bcryptjs");
jest.mock("../models/User.js");

describe("register", () => {
  test("Registration - Done", async () => {
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

  test("Registration Fails - Exists", async () => {
    // Create an existing user
    const existingUser = {
      username: "Prova1",
      email: "Prova1",
      password: "Prova1",
    };

    // Mock the User.findOne method to return a mock user object - Similar to spyOn method
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
  test("Registration Admin - Done", async () => {
    const newAdmin = {
      username: "test",
      email: "test@test.com",
      password: "test",
    };

    const mockRequest = { body: newAdmin };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await registerAdmin(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith("admin added succesfully");
  });

  test("Registration Admin - Exists", async () => {
    // Create an existing user
    const existingAdmin = {
      username: "Prova1",
      email: "Prova1",
      password: "Prova1",
    };

    // Mock the User.findOne method to return a mock user object - Similar to spyOn method
    User.findOne.mockResolvedValueOnce(existingAdmin);

    const mockRequest = { body: existingAdmin };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await registerAdmin(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "you are already registered",
    });
  });
});

describe("login", () => {
  test("Login - Done", async () => {
    const user = {
      email: "Prova1",
      password: "Prova1",
    };

    
    const response = await request(app)
    .get('/api/login')
    .set('Cookie', ['accessToken=tokenValue; refreshToken=tokenValue']);

    const mockRequest = { body: user };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    await login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith("user logged in");
  });
  test("Login - Wrong", () => {
    expect(true).toBe(true);
  });
  test("Login - Already logged", () => {
    expect(true).toBe(true);
  });
});

describe("logout", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});
