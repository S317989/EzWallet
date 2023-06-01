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

    await utilsMethods.handleDateFilterParams(mockRequest);
    expect(mockResponse.json).toHaveBeenCalledWith({
      Error: expect.stringMatching("Date must be in format YYYY-MM-DD"),
    });
  });

  test("should return the correct filter object when only date is provided", async () => {
    mockRequest.query = {
      date: "2023-05-31",
    };

    const filter = {
      date: {},
    };

    await utilsMethods.handleDateFilterParams(mockRequest);

    expect(mockResponse.json).toHaveBeenCalledWith({
      filter: expect.objectContaining({
        $gte: new Date(req.query["date"]),
      }),
    });
  });

  test("should return the correct filter object when from  is provided", async () => {
    mockRequest.query = {
      date: "2023-05-31",
      from: "2023-05-01",
    };
    const filter = {
      date: {},
    };

    await utilsMethods.handleDateFilterParams(mockRequest);

    expect(mockResponse.json).toHaveBeenCalledWith({
      filter: expect.objectContaining(($gte = new Date(req.query["from"]))),
    });
  });

  test("should return the correct filter object when from  is provided", async () => {
    mockRequest.query = {
      date: "2023-05-31",
      upTo: "2023-05-01",
    };
    const filter = {
      date: {},
    };

    const upToDate = new Date(mockRequest.query["upTo"]);
    upToDate.setHours(23);
    upToDate.setMinutes(59);
    await utilsMethods.handleDateFilterParams(mockRequest);

    expect(mockResponse.json).toHaveBeenCalledWith({
      filter: expect.objectContaining(($lte = upToDate)),
    });
  });
});

/*   
describe('handleAmountFilterParams', () => {
  test('should return an empty filter object if no minAmount or maxAmount is provided', () => {
    const req = { query: {} };
    const expectedFilter = { amount: {} };

    const result = handleAmountFilterParams(req);

    expect(result).toEqual(expectedFilter);
  });

  test('should set $gte filter if minAmount is provided and is a valid number', () => {
    const req = { query: { minAmount: '100' } };
    const expectedFilter = { amount: { $gte: 100 } };

    const result = handleAmountFilterParams(req);

    expect(result).toEqual(expectedFilter);
  });

  test('should throw an error if minAmount is provided but is not a valid number', () => {
    const req = { query: { minAmount: 'abc' } };

    expect(() => handleAmountFilterParams(req)).toThrow('Min amount must be a number');
  });

  test('should set $lte filter if maxAmount is provided and is a valid number', () => {
    const req = { query: { maxAmount: '500' } };
    const expectedFilter = { amount: { $lte: 500 } };

    const result = handleAmountFilterParams(req);

    expect(result).toEqual(expectedFilter);
  });

  test('should throw an error if maxAmount is provided but is not a valid number', () => {
    const req = { query: { maxAmount: 'xyz' } };

    expect(() => handleAmountFilterParams(req)).toThrow('Max amount must be a number');
  });

test('should set both $gte and $lte filters if both minAmount and maxAmount are provided and are valid numbers', () => {
    const req = { query: { minAmount: '100', maxAmount: '500' } };
    const expectedFilter = { amount: { $gte: 100, $lte: 500 } };

    const result = handleAmountFilterParams(req);

    expect(result).toEqual(expectedFilter);
  });
});*/
