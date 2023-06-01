import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import * as verifyAuth from "../controllers/utils.js";
import * as controllerMethods from "../controllers/controller.js";
import { Group, User } from "../models/User";

jest.mock("../models/model.js");
jest.mock("../models/User.js");

beforeAll(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
});

describe("createCategory", () => {
  beforeEach(() => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      user: { role: "Admin" },
    });
  });

  test("CreateCategory - Success", async () => {
    const categoryData = {
      type: "Cat1",
      color: "Black",
    };

    jest.spyOn(categories, "findOne").mockResolvedValue(false);

    jest.spyOn(categories.prototype, "save").mockResolvedValue(categoryData);

    const mockRequest = { body: categoryData };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    await controllerMethods.createCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        type: expect.any(String),
        color: expect.any(String),
      },
      refreshedTokenMessage: expect.any(String),
    });
  });

  test("CreateCategory - Unauthorized", async () => {
    const categoryData = { type: "food", color: "red" };

    const mockRequest = { body: categoryData };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // jest.spyOn on verifyAuth method
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      authorized: false,
      user: { role: "Admin" },
    });

    await controllerMethods.createCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });

  test("CreateCategory - Missing or Empty fields", async () => {
    const categoryData = { type: "food" };

    const mockRequest = { body: categoryData };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: "refreshedTokenMessage" },
    };

    await controllerMethods.createCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Missing or empty parameters/),
    });
  });

  test("CreateCategory - Already exists", async () => {
    const categoryData = { type: "Cat1", color: "Black" };

    const mockRequest = { body: categoryData };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { message: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "findOne").mockResolvedValue(true);

    await controllerMethods.createCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Category already exists/),
    });
  });
});

describe("updateCategory", () => {
  beforeEach(async () => {
    await categories.deleteMany({});

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      user: { role: "Admin" },
    });
  });

  test("UpdateCategory - Unauthorized", async () => {
    const categoryData = { type: "food", color: "red" };

    const mockRequest = { body: categoryData };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // jest.spyOn on verifyAuth method
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: false,
      user: { role: "Admin" },
    });

    await controllerMethods.updateCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });

  test("UpdateCategory - Missing or Empty fields", async () => {
    const categoryData = { color: "red" };

    const mockRequest = {
      body: categoryData,
      params: { type: "oldCategoryType" },
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "findOne").mockResolvedValue(true);

    await controllerMethods.updateCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Missing or empty parameters/),
      refreshedTokenMessage: expect.stringMatching(/refreshedTokenMessage/),
    });
  });

  test("UpdateCategory - Old Category not exists", async () => {
    const categoryData = { type: "food", color: "blue" };

    const mockRequest = {
      body: categoryData,
      params: { type: "oldCategoryType" },
    };
    const oldCategoryType = mockRequest.params.type;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "findOne").mockResolvedValue(null);

    await controllerMethods.updateCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(
        `Category ${oldCategoryType} doesn't exists`
      ),
      refreshedTokenMessage: expect.stringMatching(/refreshedTokenMessage/),
    });
  });

  test("UpdateCategory - Category already exists", async () => {
    const categoryData = { type: "food", color: "blue" };

    const mockRequest = {
      body: categoryData,
      params: { type: "oldCategoryType" },
    };

    const oldCategoryType = mockRequest.params.type;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "findOne").mockResolvedValue(true);

    await controllerMethods.updateCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(
        `Category ${categoryData.type} already exists`
      ),
      refreshedTokenMessage: expect.stringMatching(/refreshedTokenMessage/),
    });
  });

  test("Update Category - Success", async () => {
    const categoryData = {
      type: "NewCat",
      color: "NewColor",
    };

    const oldCategoryType = { type: "OldCategoryType" };

    const mockRequest = { params: oldCategoryType, body: categoryData };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "findOne").mockResolvedValueOnce(true);
    jest.spyOn(categories, "findOne").mockResolvedValueOnce(false);
    jest
      .spyOn(categories, "findOneAndUpdate")
      .mockResolvedValueOnce(categoryData);
    jest.spyOn(categories, "countDocuments").mockResolvedValueOnce(1);

    await controllerMethods.updateCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        message: expect.stringContaining(
          `Category ${oldCategoryType.type} updated to [${categoryData.type}, ${categoryData.color}] successfully`
        ),
        count: expect.any(Number),
      },
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });
});

describe("deleteCategory", () => {
  beforeEach(async () => {
    await categories.deleteMany({});

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      user: { role: "Admin" },
    });
  });

  test("Delete category - Success - Only One Category", async () => {
    const mockRequest = {
      body: {
        types: ["Cat1"],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest
      .spyOn(categories, "find")
      .mockResolvedValueOnce([{ type: "Cat1" }, { type: "Cat2" }]);

    jest.spyOn(categories, "find").mockResolvedValueOnce([{ type: "Cat1" }]);

    jest.spyOn(categories, "countDocuments").mockResolvedValueOnce(2);

    jest.spyOn(categories, "deleteMany").mockResolvedValue();

    jest.spyOn(transactions, "updateMany").mockResolvedValue();

    await controllerMethods.deleteCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        message: "Categories Cat1 successfully deleted!",
        count: expect.any(Number),
      },
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("Delete category - Success - All Category, One left", async () => {
    const mockRequest = {
      body: {
        types: ["Cat1", "Cat2"],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest
      .spyOn(categories, "find")
      .mockResolvedValueOnce([{ type: "Cat1" }, { type: "Cat2" }]);

    jest
      .spyOn(categories, "find")
      .mockResolvedValueOnce([{ type: "Cat1" }, { type: "Cat2" }]);

    jest.spyOn(categories, "countDocuments").mockResolvedValueOnce(2);

    jest.spyOn(categories, "deleteMany").mockResolvedValue();

    jest.spyOn(transactions, "updateMany").mockResolvedValue();

    await controllerMethods.deleteCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        message: "Categories Cat2 successfully deleted!",
        count: expect.any(Number),
      },
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("Delete category - Unauthorized", async () => {
    const mockRequest = {
      body: {
        types: ["Cat1", "Cat2"],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: false,
      user: { role: "Admin" },
    });

    await controllerMethods.deleteCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });

  test("Delete category - Missing or Empty parameters", async () => {
    const mockRequest = {
      body: ["Cat1", "Cat2"],
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    await controllerMethods.deleteCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Missing or empty parameters/),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("Delete category - Empty string in type array", async () => {
    const mockRequest = {
      body: {
        types: ["Cat1", ""],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    await controllerMethods.deleteCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Empty string in types array/),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("Delete category - No categories can be deleted", async () => {
    const mockRequest = {
      body: {
        types: ["Cat1", "Cat2"],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "find").mockResolvedValueOnce([{ type: "Cat1" }]);

    await controllerMethods.deleteCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/No categories can be deleted/),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("Delete category - Category not found", async () => {
    const mockRequest = {
      body: {
        types: ["Cat1", "Cat2"],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "find").mockResolvedValue(false);

    await controllerMethods.deleteCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(
        `Categories ${mockRequest.body.types} don't exist`
      ),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });
});

describe("getCategories", () => {
  beforeEach(() => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      user: { role: "Simple" },
    });
  });

  test("GetCategories - Success", async () => {
    const mockedCategories = [
      { type: "category1", color: "red" },
      { type: "category2", color: "blue" },
      { type: "category3", color: "green" },
    ];

    const mockRequest = {};

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "find").mockResolvedValue(mockedCategories);

    await controllerMethods.getCategories(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockedCategories,
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("GetCategories - Empty List", async () => {
    const mockedCategories = [];

    const mockRequest = {};

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(categories, "find").mockResolvedValue(mockedCategories);

    await controllerMethods.getCategories(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockedCategories,
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("GetCategories - Unauthorized", async () => {
    const mockRequest = {};

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: false,
      user: { role: "Simple" },
    });

    await controllerMethods.getCategories(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });
});

describe("createTransaction", () => {
  let mockedTransaction, mockRequest, mockResponse;

  beforeEach(() => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      user: { role: "Simple" },
    });

    mockedTransaction = {
      username: "Test1",
      amount: 100,
      type: "food",
      date: "2023/01/01",
    };

    mockRequest = {
      body: mockedTransaction,
      params: {
        username: "Test1",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("CreateTransaction - Success", async () => {
    // Mock isNan and parseFloat on amount param
    jest.spyOn(global, "isNaN").mockReturnValueOnce(false);
    jest.spyOn(global, "parseFloat").mockReturnValueOnce(true);

    // Mock findOne methods
    jest.spyOn(categories, "findOne").mockResolvedValue(true);
    jest.spyOn(User, "findOne").mockResolvedValue(true);

    jest
      .spyOn(transactions.prototype, "save")
      .mockResolvedValue(mockedTransaction);

    await controllerMethods.createTransaction(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockedTransaction,
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("CreateTransaction - Unauthorized", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: false,
      user: { role: "Simple" },
    });

    await controllerMethods.createTransaction(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });

  test("CreateTransaction - Missing or empty parameters", async () => {
    delete mockedTransaction.username;

    await controllerMethods.createTransaction(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Missing or empty parameters/),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("CreateTransaction - Amount is not a number", async () => {
    mockedTransaction.amount = "NoNumber";

    await controllerMethods.createTransaction(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Amount is not a number/),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("CreateTransaction - Username not equivalent", async () => {
    mockedTransaction.username = "Test2";

    await controllerMethods.createTransaction(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Username values are not equivalent/),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("CreateTransaction - Username (or Category) doesn't exists", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(false);

    await controllerMethods.createTransaction(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(
        `Username ${mockedTransaction.username} or category ${mockedTransaction.type} doesn't exist`
      ),
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });
});

describe("getAllTransactions", () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      user: { role: "Admin" },
    });

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("GetAllTransactions - Success", async () => {
    const mockTransactions = [
      { id: "1", amount: 100, category: "1", date: "D1" },
      { id: "2", amount: 200, category: "2", date: "D2" },
      { id: "3", amount: 50, category: "3", date: "D3" },
    ];

    jest
      .spyOn(mockTransactions, "unshift")
      .mockReturnValueOnce(mockTransactions);

    jest.spyOn(transactions, "aggregate").mockReturnValueOnce(mockTransactions);

    jest.spyOn(mockTransactions, "map").mockReturnValueOnce(mockTransactions);

    await controllerMethods.getAllTransactions(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockTransactions,
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("GetAllTransactions - Empty list", async () => {
    const mockTransactions = [];

    jest
      .spyOn(mockTransactions, "unshift")
      .mockReturnValueOnce(mockTransactions);

    jest.spyOn(transactions, "aggregate").mockReturnValueOnce(mockTransactions);

    jest.spyOn(mockTransactions, "map").mockReturnValueOnce(mockTransactions);

    await controllerMethods.getAllTransactions(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockTransactions,
      refreshedTokenMessage: "refreshedTokenMessage",
    });
  });

  test("GetAllTransactions - Unauthorized", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: false,
      user: { role: "Admin" },
    });

    await controllerMethods.getAllTransactions(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });
});

describe("getTransactionsByUser", () => {
  let mockRequest, mockResponse, mockTransaction, user;

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});

    user = {
      username: "Test1",
      password: "Test1",
      email: "test1@test1.com",
      refreshToken: "refreshToken",
    };

    await User.create(user);

    mockRequest = {
      params: { username: user.username },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "refreshedTokenMessage",
      },
    };

    jest.spyOn(User, "findOne").mockResolvedValue(user);
  });

  describe("Admin User", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "Admin" },
      });

      mockTransaction = [
        {
          id: "1",
          amount: 100,
          type: "food",
          date: "2023-05-17",
          username: "123456",
        },
      ];

      jest.spyOn(mockTransaction, "map").mockReturnValue(mockTransaction);

      mockRequest.url = `localhost:3000/api/transactions/users/${mockRequest.params.username}`;
    });

    test("GetTransactionByUser - Admin - Success", async () => {
      jest
        .spyOn(transactions, "aggregate")
        .mockReturnValueOnce(mockTransaction);

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransaction,
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - Admin - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "Admin" },
      });

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByUser - Admin - User not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/User not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - Admin - No transactions", async () => {
      mockTransaction = [];

      jest.spyOn(transactions, "aggregate").mockReturnValueOnce([]);

      jest.spyOn(mockTransaction, "map").mockReturnValueOnce([]);

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });

  describe("Regular User", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "User" },
      });

      mockTransaction = [
        {
          //id: "1",
          username: "TestUser",
          amount: 100,
          type: "food",
          color: "red",
          date: "2023-04-30",
        },
      ];

      mockRequest.url = `localhost:3000/api/users/${mockRequest.params.username}/transactions`;
    });

    test("GetTransactionByUser - User - Success - Date Filter with filled list", async () => {
      mockRequest.query = { date: "2023-04-29" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => transaction.date >= mockRequest.query.date)
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransaction,
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - Date Filter with empty list", async () => {
      mockRequest.query = { date: "2023-04-31" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => transaction.date >= mockRequest.query.date)
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - From filter with filled list", async () => {
      mockRequest.query = { from: "2023-04-29" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => transaction.date >= mockRequest.query.from)
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransaction,
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - From Filter with empty list", async () => {
      mockRequest.query = { from: "2023-04-31" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => transaction.date > mockRequest.query.from)
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - UpTo filter with filled list", async () => {
      mockRequest.query = { from: "2023-04-31" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => transaction.date <= mockRequest.query.from)
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransaction,
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - UpTo Filter with empty list", async () => {
      mockRequest.query = { upTo: "2023-04-29" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => transaction.date <= mockRequest.query.upTo)
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - MinAmount Filter with empty list", async () => {
      mockRequest.query = { minAmount: "110" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.amount >= mockRequest.query.minAmount
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - MinAmount Filter with filled list", async () => {
      mockRequest.query = { minAmount: "90" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.amount >= mockRequest.query.minAmount
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransaction,
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - MaxAmount Filter with empty list", async () => {
      mockRequest.query = { maxAmount: "90" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.amount <= mockRequest.query.maxAmount
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Success - MaxAmount Filter with filled list", async () => {
      mockRequest.query = { maxAmount: "110" };

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.amount <= mockRequest.query.maxAmount
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransaction,
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Throws error cause From and UpTo cannot be together", async () => {
      mockRequest.query = { upTo: "2023-04-29", from: "2023-04-29" };

      jest
        .spyOn(verifyAuth, "handleDateFilterParams")
        .mockImplementationOnce(() => {
          throw new Error("From and UpTo cannot be together");
        });

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/From and UpTo cannot be together/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUser - User - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "User" },
      });

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByUser - User - User not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/User not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });
});

describe("getTransactionsByUserByCategory", () => {
  let mockRequest, mockResponse, mockTransaction, user;

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});

    user = {
      username: "Test1",
      password: "Test1",
      email: "test1@test1.com",
      refreshToken: "refreshToken",
    };

    await User.create(user);

    mockRequest = {
      params: { username: user.username, category: "food" },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "refreshedTokenMessage",
      },
    };

    jest.spyOn(User, "findOne").mockResolvedValue(user);
  });

  describe("Admin", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "Admin" },
      });

      mockTransaction = [
        {
          //id: "1",
          amount: 100,
          color: "red",
          type: "food",
          date: "2023-05-17",
          username: "TestUser",
        },
      ];

      jest.spyOn(categories, "findOne").mockResolvedValue(mockTransaction);

      jest.spyOn(mockTransaction, "map").mockReturnValue(mockTransaction);

      mockRequest.url = `localhost:3000/api/transactions/users/${mockRequest.params.username}/category/${mockTransaction[0].category}`;
    });

    test("GetTransactionByUserByCategory - Admin - Success - Filled list", async () => {
      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: expect.arrayContaining(mockTransaction),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUserByCategory - Admin - Success - Empty list", async () => {
      mockRequest.params.category = "test";

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUserByCategory - Admin - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "Admin" },
      });

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByUserByCategory - Admin - User not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/User not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUserByCategory - Admin - Category not found", async () => {
      jest.spyOn(categories, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Category not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });

  describe("User", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "User" },
      });

      mockTransaction = [
        {
          //id: "1",
          amount: 100,
          color: "red",
          type: "food",
          date: "2023-05-17",
          username: "TestUser",
        },
      ];

      jest.spyOn(categories, "findOne").mockResolvedValue(mockTransaction);

      jest.spyOn(mockTransaction, "map").mockReturnValue(mockTransaction);

      mockRequest.url = `localhost:3000/api/users/${mockRequest.params.username}/transactions/category/${mockTransaction[0].category}`;
    });

    test("GetTransactionByUserByCategory - User - Success - Filled list", async () => {
      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: expect.arrayContaining(mockTransaction),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUserByCategory - User - Success - Empty list", async () => {
      mockRequest.params.category = "test";

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) => transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUserByCategory - User - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "User" },
      });

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByUserByCategory - User - User not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/User not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByUserByCategory - User - Category not found", async () => {
      jest.spyOn(categories, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByUserByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Category not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });
});

describe("getTransactionsByGroup", () => {
  let mockRequest, mockResponse, mockTransaction, group;

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});

    group = {
      name: "GroupTest",
      members: ["TestUser1", "TestUser2"],
    };

    await Group.create(group);

    mockRequest = {
      params: { name: "GroupTest" },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "refreshedTokenMessage",
      },
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
  });

  describe("Admin", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "Admin" },
      });

      mockTransaction = [
        {
          //id: "1",
          amount: 100,
          color: "red",
          type: "food",
          date: "2023-05-17",
          username: "TestUser1",
        },
      ];

      jest.spyOn(mockTransaction, "map").mockReturnValue(mockTransaction);

      mockRequest.url = `localhost:3000/api/transactions/groups/${mockRequest.params.username}`;
    });

    test("GetTransactionByGroup - Admin - Success - Filled list", async () => {
      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => group.members.includes(transaction.username))
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: expect.arrayContaining(mockTransaction),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroup - Admin - Success - Empty list", async () => {
      group.members = ["TestUser3", "TestUser4"];

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => group.members.includes(transaction.username))
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroup - Admin - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "Admin" },
      });

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByGroup - Admin - Group not found", async () => {
      jest.spyOn(Group, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Group not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });

  describe("Group", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "Group", members: group.members },
      });

      mockTransaction = [
        {
          //id: "1",
          amount: 100,
          color: "red",
          type: "food",
          date: "2023-05-17",
          username: "TestUser1",
        },
      ];

      jest.spyOn(mockTransaction, "map").mockReturnValue(mockTransaction);

      mockRequest.url = `localhost:3000/api/groups/${mockRequest.params.name}/transactions`;
    });

    test("GetTransactionByGroup - Group - Success - Filled list", async () => {
      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => group.members.includes(transaction.username))
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: expect.arrayContaining(mockTransaction),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroup - Group - Success - Empty list", async () => {
      group.members = ["TestUser3", "TestUser4"];

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter((transaction) => group.members.includes(transaction.username))
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroup - Group - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "Group", members: group.members },
      });

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByGroup - Group - Group not found", async () => {
      jest.spyOn(Group, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Group not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });
});

describe("getTransactionsByGroupByCategory", () => {
  let mockRequest, mockResponse, mockTransaction, group;

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});

    group = {
      name: "GroupTest",
      members: ["TestUser1", "TestUser2"],
    };

    await Group.create(group);

    mockRequest = {
      params: { name: "GroupTest", category: "food" },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "refreshedTokenMessage",
      },
    };

    jest.spyOn(Group, "findOne").mockResolvedValue(group);
    jest
      .spyOn(categories, "findOne")
      .mockResolvedValue(mockRequest.params.category);
  });

  describe("Admin", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "Admin" },
      });

      mockTransaction = [
        {
          //id: "1",
          amount: 100,
          color: "red",
          type: "food",
          date: "2023-05-17",
          username: "TestUser1",
        },
      ];

      jest.spyOn(mockTransaction, "map").mockReturnValue(mockTransaction);

      mockRequest.url = `localhost:3000/api/transactions/groups/${mockRequest.params.name}/category/${mockRequest.params.category}`;
    });

    test("GetTransactionByGroupByCategory - Admin - Success - Filled list", async () => {
      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) =>
              group.members.includes(transaction.username) &&
              transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: expect.arrayContaining(mockTransaction),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroupByCategory - Admin - Success - Empty list", async () => {
      mockRequest.params.category = "test";

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) =>
              group.members.includes(transaction.username) &&
              transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroupByCategory - Admin - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "Admin" },
      });

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByGroupByCategory - Admin - Group not found", async () => {
      jest.spyOn(Group, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Group not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroupByCategory - Admin - Category not found", async () => {
      jest.spyOn(categories, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Category not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });

  describe("Group", () => {
    beforeEach(() => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
        flag: true,
        user: { role: "Group", members: group.members },
      });

      mockTransaction = [
        {
          //id: "1",
          amount: 100,
          color: "red",
          type: "food",
          date: "2023-05-17",
          username: "TestUser1",
        },
      ];

      jest.spyOn(mockTransaction, "map").mockReturnValue(mockTransaction);

      mockRequest.url = `localhost:3000/api/groups/${mockRequest.params.name}/transactions/category/${mockRequest.params.category}`;
    });

    test("GetTransactionByGroupByCategory - Group - Success - Filled list", async () => {
      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) =>
              group.members.includes(transaction.username) &&
              transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: expect.arrayContaining(mockTransaction),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroupByCategory - Group - Success - Empty list", async () => {
      mockRequest.params.category = "test";

      transactions.aggregate.mockResolvedValueOnce(
        mockTransaction
          .filter(
            (transaction) =>
              group.members.includes(transaction.username) &&
              transaction.type === mockRequest.params.category
          )
          .map((v) => ({
            //_id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            categories_info: { color: "red" },
            date: v.date,
          }))
      );

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroupByCategory - Group - Unauthorized", async () => {
      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        user: { role: "Group", members: ["Test2", "Test3"] },
      });

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
      });
    });

    test("GetTransactionByGroupByCategory - Group - Group not found", async () => {
      jest.spyOn(Group, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Group not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });

    test("GetTransactionByGroupByCategory - Group - Category not found", async () => {
      jest.spyOn(categories, "findOne").mockResolvedValueOnce(false);

      await controllerMethods.getTransactionsByGroupByCategory(
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Category not found/),
        refreshedTokenMessage: "refreshedTokenMessage",
      });
    });
  });
});

describe("deleteTransaction", () => {
  test("Should delete a transaction by ID", async () => {
    const transactionId = "123456";
    const mockDeletedTransaction = {
      id: "123456",
      amount: 100,
      category: "food",
      date: "2023-05-17",
      groupId: "789012",
    };

    // Configure the model function to return the simulated deleted transaction
    transactions.deleteOne.mockResolvedValue({ n: 1, deletedCount: 1, ok: 1 });

    // Make a simulated DELETE request to the endpoint corresponding to the deletion of a transaction by ID
    const response = await request(app).delete(
      `/api/transactions/${transactionId}`
    );

    // Check if the response is correct (HTTP status 200, deleted transaction returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDeletedTransaction);

    // Check if the template function was called with the transaction ID as a query parameter
    expect(transactions.deleteOne).toHaveBeenCalledWith({ _id: transactionId });
  });

  test("Should return an error if the transaction to delete is not found", async () => {
    const transactionId = "123456";

    // Configure the template function to return a transaction delete without result
    transactions.deleteOne.mockResolvedValue({ n: 0, deletedCount: 0, ok: 1 });

    // Make a simulated DELETE request to the endpoint corresponding to the deletion of a transaction by ID
    const response = await request(app).delete(
      `/api/transactions/${transactionId}`
    );

    // Check if the response is correct (HTTP status 404, error message returned)
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Transaction not found" });

    // Check if the template function was called with the transaction ID as a query parameter
    expect(transactions.deleteOne).toHaveBeenCalledWith({ _id: transactionId });
  });
});

describe("deleteTransactions", () => {
  test("Should delete multiple transactions by IDs", async () => {
    const transactionIds = ["1", "8", "9"];
    const mockDeletedTransactions = [
      { id: "1", amount: 100000, category: "food", date: "D1", groupId: "G1" },
      {
        id: "8",
        amount: 300,
        category: "transportation",
        date: "D2",
        groupId: "G2",
      },
      { id: "9", amount: 20, category: "shopping", date: "D3", groupId: "G3" },
    ];

    // Configure the template function to return simulated deleted transactions
    transactions.deleteMany.mockResolvedValue({ n: 3, deletedCount: 3, ok: 1 });

    // Make a simulated DELETE request to the endpoint corresponding to the deletion of several transactions by IDs
    const response = await request(app)
      .delete("/api/transactions")
      .send({ ids: transactionIds });

    // Check if the response is correct (HTTP status 200, deleted transactions returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDeletedTransactions);

    // Check if the template function has been called with the transaction IDs as a query parameter
    expect(transactions.deleteMany).toHaveBeenCalledWith({
      _id: { $in: transactionIds },
    });
  });

  test("Should return an error if no transaction IDs are provided", async () => {
    // Make a simulated DELETE request to the endpoint corresponding to the deletion of several transactions without IDs
    const response = await request(app).delete("/api/transactions").send({});

    // Check if the response is correct (HTTP status 400, error message returned)
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "No transaction IDs provided" });

    // Check if the model function has not been called
    expect(transactions.deleteMany).not.toHaveBeenCalled();
  });
});
