import { User } from "../models/User.js";
import * as authMethods from "../controllers/auth.js";
import * as verifyAuth from "../controllers/utils.js";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("bcryptjs");
jest.mock("../models/User.js");

describe("register", () => {
  let mockRequest;
  let mockResponse;
  let user;

  beforeEach(() => {
    user = {
      username: "Test1",
      email: "test1@test1.com",
      password: "Test1",
      save: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(User, "findOne").mockResolvedValue(user);
    jest.spyOn(User, "create").mockResolvedValue(user);

    mockRequest = { body: user };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  test("Registration - Done", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(false);

    await authMethods.register(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        message: expect.stringContaining(
          `User ${user.username} added succesfully`
        ),
      },
    });
  });

  test("Registration - Exists", async () => {
    await authMethods.register(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "you are already registered",
    });
  });

  test("Registration - Invalid Email", async () => {
    // Create an existing user
    mockRequest.body.email = "Test1";

    await authMethods.register(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Invalid email",
    });
  });
});

describe("registerAdmin", () => {
  let mockRequest;
  let mockResponse;
  let admin;

  beforeEach(() => {
    admin = {
      username: "TestAdmin",
      email: "testadmin@testadmin.com",
      password: "TestAdmin",
      save: jest.fn().mockResolvedValue({}),
    };

    // jest.spyOn on verifyAuth method
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      user: { role: "Admin" },
    });
    jest.spyOn(User, "findOne").mockResolvedValue(admin);
    jest.spyOn(User, "create").mockResolvedValue(admin);

    mockRequest = { body: admin };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  test("Registration Admin - Done", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);

    await authMethods.registerAdmin(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: expect.objectContaining({
        message: expect.stringContaining(
          `Admin ${admin.username} added succesfully`
        ),
      }),
    });
  });

  test("Registration Admin - Already Registered", async () => {
    await authMethods.registerAdmin(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: expect.stringContaining("you are already registered"),
    });
  });

  test("Registration Admin - Invalid Email", async () => {
    mockRequest.body.email = "TestAdmin";

    await authMethods.registerAdmin(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Invalid email"),
    });
  });
});

describe("login", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    const user = {
      email: "test1@test1.com",
      password: "Test1",
      save: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(User, "findOne").mockResolvedValue(user);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    jest.spyOn(jwt, "sign").mockReturnValue("");

    mockRequest = { body: user };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  test("Login - Done", async () => {
    await authMethods.login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    });
  });

  test("Login - Wrong Credentials", async () => {
    // Modifica solo i dati specifici necessari per questo test
    mockRequest.body.password = "Prova2";

    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    await authMethods.login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "wrong credentials",
    });
  });

  test("Login - User Not Registered", async () => {
    // Modifica solo i dati specifici necessari per questo test
    mockRequest.body.email = "notregisterd@notregisterd.com";
    mockRequest.body.password = "notregisterd";

    jest.spyOn(User, "findOne").mockResolvedValue(null);

    await authMethods.login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "please you need to register",
    });
  });
});

describe("logout", () => {
  let mockRequest, mockResponse, user;

  beforeEach(() => {
    user = {
      email: "test1@test1.com",
      password: "Test1",
      save: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(verifyAuth, "verifyAuth").mockImplementation(() => ({
      flag: true,
      user: { role: "Simple" },
    }));
    jest.spyOn(User, "findOne").mockResolvedValue(user);

    mockRequest = {
      body: user,
      cookies: {
        refreshToken: "mockedRefreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  test("Logout - Done", async () => {
    await authMethods.logout(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: expect.objectContaining({
        message: expect.stringContaining("logged out"),
      }),
    });
  });

  test("Logout - Already logged out", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockImplementation(() => ({
      flag: false,
      user: { role: "Simple" },
    }));

    await authMethods.logout(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringContaining("you are already logged out"),
    });
  });

  test("Logout - User not found", async () => {
    mockRequest.cookies.refreshToken = null;

    await authMethods.logout(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringContaining("user not found"),
    });
  });
});
