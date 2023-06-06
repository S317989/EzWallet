import * as utilsMethods from "../controllers/utils.js";
import request from "supertest";
import { app } from "../app";
import dotenv from "dotenv";

const jwt = require("jsonwebtoken");

dotenv.config();

let mockRequest, mockResponse;

describe("handleDateFilterParams", () => {
  test("HandleDateFilterParams - upTo and from cannot be together", (done) => {
    mockRequest = {
      query: {
        date: "2023-05-31",
        from: "2023-05-01",
        upTo: "2023-05-31",
      },
    };

    expect(() => {
      utilsMethods.handleDateFilterParams(mockRequest);
    }).toThrow(Error);
    done();
  });

  test("HandleDateFilterParams -  Date not in format YYYY-MM-DD", async () => {
    mockRequest = {
      query: {
        date: "2023/05/30",
      },
    };

    expect(() => {
      utilsMethods.handleDateFilterParams(mockRequest);
    }).toThrow(Error);
  });

  test("HandleDateFilterParams - Success with date filter", async () => {
    mockRequest = {
      query: {
        date: "2023-05-31",
      },
    };

    const expectedFilter = {
      date: {
        $gte: new Date(mockRequest.query["date"]),
      },
    };

    expect(utilsMethods.handleDateFilterParams(mockRequest)).toEqual(
      expectedFilter
    );
  });

  test("HandleDateFilterParams - Success with from filter", async () => {
    mockRequest = {
      query: {
        from: "2023-05-01",
      },
    };

    const expectedFilter = {
      date: {
        $gte: new Date(mockRequest.query["from"]),
      },
    };
    expect(utilsMethods.handleDateFilterParams(mockRequest)).toEqual(
      expectedFilter
    );
  });

  test("HandleDateFilterParams - Success with upTo filter", async () => {
    mockRequest = {
      query: {
        upTo: "2023-05-01",
      },
    };

    const upToDate = new Date(mockRequest.query["upTo"]);
    upToDate.setHours(23);
    upToDate.setMinutes(59);

    const expectedFilter = {
      date: {
        $lte: upToDate,
      },
    };
    /*
      expect(() => {
        utilsMethods.handleDateFilterParams(mockRequest);
      }).not.toThrow(expectedFilter);
    });
    */

    expect(utilsMethods.handleDateFilterParams(mockRequest)).toEqual(
      expectedFilter
    );
  });
});

describe("handleAmountFilterParams", () => {
  test("HandleAmountFilterParams - Min amount not a number", () => {
    mockRequest = {
      query: {
        minAmount: "abc",
      },
    };

    expect(() => {
      handleAmountFilterParams(mockRequest, data);
    }).toThrow(Error);
  });

  test("HandleAmountFilterParams - MaxAmount not a number", () => {
    mockRequest = {
      query: {
        maxAmount: "def",
      },
    };

    expect(() => {
      handleAmountFilterParams(mockRequest, data);
    }).toThrow(Error);
  });

  test("HandleAmountFilterParams - Success with minAmount and maxAmount filters", () => {
    mockRequest = {
      query: {
        minAmount: "100",
        maxAmount: "500",
      },
    };

    const expectedFilter = {
      amount: {
        $gte: 100,
        $lte: 500,
      },
    };

    expect(utilsMethods.handleAmountFilterParams(mockRequest)).toEqual(
      expectedFilter
    );
  });

  test("HandleAmountFilterParams - Success with only minAmount filter", () => {
    mockRequest = {
      query: {
        minAmount: "100",
      },
    };

    const expectedFilter = {
      amount: {
        $gte: 100,
      },
    };

    expect(utilsMethods.handleAmountFilterParams(mockRequest)).toEqual(
      expectedFilter
    );
  });

  test("HandleAmountFilterParams - Success with only maxAmount filter", () => {
    mockRequest = {
      query: {
        maxAmount: "500",
      },
    };

    const expectedFilter = {
      amount: {
        $lte: 500,
      },
    };

    expect(utilsMethods.handleAmountFilterParams(mockRequest)).toEqual(
      expectedFilter
    );
  });

  describe("verifyAuth", () => {
    let accessToken, refreshToken;

    test("VerifyAuth - Success", () => {
      accessToken = jwt.sign(
        {
          username: "User",
          email: "user@email.com",
          id: "1",
          role: "Regular",
        },
        process.env.ACCESS_KEY,
        { expiresIn: "1h" }
      );

      refreshToken = jwt.sign(
        {
          username: "User",
          email: "user@email.com",
          id: "1",
          role: "Regular",
        },
        process.env.ACCESS_KEY,
        { expiresIn: "7d" }
      );

      mockRequest = {
        cookies: {
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      };

      mockResponse = {
        cookie: jest.fn(),
        locals: {},
      };

      const result = utilsMethods.verifyAuth(mockRequest, mockResponse, {});

      expect(result.flag).toBe(true);
      expect(result.cause).toBe("Authorized");
    });

    test("VerifyAuth - Tokens missing", () => {
      const mockReq = {
        cookies: {},
      };
      const mockRes = {};

      expect(utilsMethods.verifyAuth(mockReq, mockRes)).toEqual({
        flag: false,
        cause: "Unauthorized",
      });
    });

    test("VerifyAuth - Tokens is missing information", () => {
      const mockReq = {
        cookies: {
          accessToken: "mockAccessToken",
          refreshToken: "mockRefreshToken",
        },
      };

      jest
        .spyOn(jwt, "verify")
        .mockImplementationOnce((token, key) => {
          if (token === "mockAccessToken") {
            return {
              username: "1",
              email: "2",
              role: "admin",
            };
          } else if (token === "mockRefreshToken") {
            return {
              email: "2",
              role: "admin",
            };
          }
        })
        .mockImplementationOnce((token, key) => {
          if (token === "mockAccessToken") {
            return {
              username: "1",
              email: "2",
              role: "admin",
            };
          } else if (token === "mockRefreshToken") {
            return {
              email: "2",
              role: "admin",
            };
          }
        });
      const mockRes = {};
      const mockInfo = {};

      const result = utilsMethods.verifyAuth(mockReq, mockRes, mockInfo);
      expect(result.flag).toBe(false);
      expect(result.cause).toBe("Token is missing information");
    });

    test("VerifyAuth - Mismatched users", () => {
      const mockReq = {
        cookies: {
          accessToken: "mockAccessToken",
          refreshToken: "mockRefreshToken",
        },
      };

      jest
        .spyOn(jwt, "verify")
        .mockImplementationOnce((token, key) => {
          if (token === "mockAccessToken") {
            return {
              username: "1",
              email: "2",
              role: "admin",
            };
          } else if (token === "mockRefreshToken") {
            return {
              username: "12",
              email: "2",
              role: "admin",
            };
          }
        })
        .mockImplementationOnce((token, key) => {
          if (token === "mockAccessToken") {
            return {
              username: "1",
              email: "2",
              role: "admin",
            };
          } else if (token === "mockRefreshToken") {
            return {
              username: "12",
              email: "2",
              role: "admin",
            };
          }
        });
      const decodedAccessToken = { username: "1", email: "2", role: "3" };
      const decodedRefreshToken = { username: "12", email: "2", role: "A" };

      const mockRes = {};
      const mockInfo = {};

      const result = utilsMethods.verifyAuth(mockReq, mockRes, mockInfo);

      expect(result.flag).toBe(false);
      expect(result.cause).toBe("Mismatched users");
    });

    test("VerifyAuth - AccessToken expired", () => {
      refreshToken = jwt.sign(
        {
          username: "User",
          email: "user@email.com",
          id: "1",
          role: "Regular",
        },
        process.env.ACCESS_KEY,
        { expiresIn: "7d" }
      );

      mockRequest = {
        cookies: {
          accessToken: "expired-access-token",
          refreshToken: refreshToken,
        },
      };



      mockResponse = {
        cookie: jest.fn(),
        locals: {},
      };

      // Mock della funzione jwt.verify per il token scaduto
      jest.spyOn(jwt, "verify").mockImplementationOnce((token, key) => {
        throw new jwt.TokenExpiredError("Token expired");
      });

      const result = utilsMethods.verifyAuth(mockRequest, mockResponse, {});



      expect(result.flag).toBe(true);
      expect(result.cause).toBe("Authorized");


      expect(mockResponse.locals.message).toBe(
        "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls"
      );
    });
  });
});
