import * as utilsMethods from "../controllers/utils.js";
import request from "supertest";
import { app } from "../app";

const jwt = require("jsonwebtoken");

describe("handleDateFilterParams", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  test("should throw an error if date is provided with from or upTo", (done) => {
    mockRequest.query = {
      date: "2023-05-31",
      from: "2023-05-01",
      upTo: "2023-05-31",
    };

    expect(() => {
      utilsMethods.handleDateFilterParams(mockRequest);
    }).toThrow(Error);
    done();
  });

  test("should throw an error if date is not in the format YYYY-MM-DD", async () => {
    mockRequest.query = {
      date: "2023/05/31",
    };

    expect(() => {
      utilsMethods.handleDateFilterParams(mockRequest);
    }).toThrow(Error);
  });

  test("should return the correct filter object when only date is provided", async () => {
    mockRequest.query = {
      date: "2023-05-31",
    };

    const expectedFilter = {
      date: {
        $gte: new Date(mockRequest.query["date"]),
      },
    };

    expect(() => {
      utilsMethods.handleDateFilterParams(mockRequest);
    }).toThrow(expectedFilter);
  });

  test("should return the correct filter object when from  is provided", async () => {
    mockRequest.query = {
      date: "2023-05-31",
      from: "2023-05-01",
    };

    const expectedFilter = {
      date: {
        $gte: new Date(mockRequest.query["from"]),
      },
    };

    expect(() => {
      utilsMethods.handleDateFilterParams(mockRequest);
    }).toThrow(expectedFilter);
  });

  test("should return the correct filter object when upTo  is provided", async () => {
    mockRequest.query = {
      date: "2023-05-31",
      upTo: "2023-05-01",
    };

    const upToDate = new Date(mockRequest.query["upTo"]);
    upToDate.setHours(23);
    upToDate.setMinutes(59);

    const expectedFilter = {
      date: {
        $lte: upToDate,
      },
    };

    expect(() => {
      utilsMethods.handleDateFilterParams(mockRequest);
    }).toThrow(expectedFilter);
  });
});

describe("handleAmountFilterParams", () => {
  let mockRequest;
  let data;

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    data = {}; // Test data for the second argument of handleAmountFilterParams
  });

  test("should throw an error if minAmount is not a number", () => {
    mockRequest.query = {
      minAmount: "abc",
    };

    expect(() => {
      handleAmountFilterParams(mockRequest, data);
    }).toThrow(Error);
  });

  test("should throw an error if maxAmount is not a number", () => {
    mockRequest.query = {
      maxAmount: "def",
    };

    expect(() => {
      handleAmountFilterParams(mockRequest, data);
    }).toThrow(Error);
  });

  test("should return the correct filter object when minAmount and maxAmount are provided", () => {
    mockRequest.query = {
      minAmount: "100",
      maxAmount: "500",
    };

    const expectedFilter = {
      amount: {
        $gte: 100,
        $lte: 500,
      },
    };

    expect(() => {
      utilsMethods.handleAmountFilterParams(mockRequest, data);
    }).toThrow(expectedFilter);
  });

  test("should return the correct filter object when only minAmount is provided", () => {
    mockRequest.query = {
      minAmount: "100",
    };

    const expectedFilter = {
      amount: {
        $gte: 100,
      },
    };

    expect(() => {
      utilsMethods.handleAmountFilterParams(mockRequest, data);
    }).toThrow(expectedFilter);
  });

  test("should return the correct filter object when only maxAmount is provided", () => {
    mockRequest.query = {
      maxAmount: "500",
    };

    const expectedFilter = {
      amount: {
        $lte: 500,
      },
    };

    expect(() => {
      utilsMethods.handleAmountFilterParams(mockRequest, data);
    }).toThrow(expectedFilter);
  });
});
