import {
  handleDateFilterParams,
  verifyAuth,
  handleAmountFilterParams,
} from "../controllers/utils";
const jwt = require("jsonwebtoken");
import dotenv from "dotenv";

dotenv.config();

let mockRequest, mockResponse, param, user;

let accessToken, refreshToken;
beforeAll(async () => {
  user = {
    email: "user@email.com",
    id: "userid",
    username: "username",
  };

  mockRequest = {
    cookies: {
      accessToken: "",
      refreshToken: "",
    },
  };

  mockResponse = {
    cookie: jest.fn(),
    locals: {},
  };
});

describe("verifyAuth", () => {
  test("VerifyAuth - Simple - Success", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Simple",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Simple",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Simple",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({ flag: true, cause: "Authorized" });
  });

  test("VerifyAuth - Admin - Success", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Admin",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({ flag: true, cause: "Authorized" });
  });

  test("VerifyAuth - User - Success", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Regular",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Regular",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "User",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({ flag: true, cause: "Authorized" });
  });

  test("VerifyAuth - Group - Success", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Group",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Group",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Group",
      emails: [user.email, "email2"],
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({ flag: true, cause: "Authorized" });
  });

  test("VerifyAuth - Admin - Mismatched User", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "NotAdmin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Admin",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({ flag: false, cause: "Mismatched users" });
  });

  test("VerifyAuth - User - Mismatched User", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "NotRegular",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Regular",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "User",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({ flag: false, cause: "Mismatched users" });
  });

  test("VerifyAuth - Group - User not in group", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Group",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Group",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Group",
      emails: ["email1", "email2"],
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({ flag: false, cause: "User not in group" });
  });

  test("VerifyAuth - General - Access Token missing info", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Admin",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({
      flag: false,
      cause: "Token is missing information",
    });
  });

  test("VerifyAuth - General - Refresh Token missing info", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Admin",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({
      flag: false,
      cause: "Token is missing information",
    });
  });

  test("VerifyAuth - General - Refresh Token missing info", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );

    refreshToken = jwt.sign(
      {
        email: "wrongemail@email.com",
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Admin",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({
      flag: false,
      cause: "Mismatched users",
    });
  });

  test("VerifyAuth - General - Access Token expired", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Simple",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "-1ms" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "7d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Simple",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({
      flag: true,
      cause: "Authorized",
    });

    expect(mockResponse.locals).toEqual({
      message:
        "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls",
    });
  });

  test("VerifyAuth - General - Perform Login Again", async () => {
    accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Simple",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "-1ms" }
    );

    refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
        role: "Admin",
      },
      process.env.ACCESS_KEY,
      { expiresIn: "-1d" }
    );

    mockRequest.cookies.accessToken = accessToken;
    mockRequest.cookies.refreshToken = refreshToken;

    param = {
      authType: "Simple",
    };

    const response = verifyAuth(mockRequest, mockResponse, param);

    expect(response).toEqual({
      flag: false,
      cause: "Perform login again",
    });
  });
});
