import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";

jest.mock("../models/model");

beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
});

describe("createCategory", () => {
  test("should create a new category", async () => {
    const categoryData = { type: "investment", color: "#fcbe44" };

    // Make a simulated POST request to the endpoint corresponding to the creation of a category

    const response = await request(app)
      .post("/api/categories")
      .send(categoryData);

    // verify if the response is correct
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("type", categoryData.type);
    expect(response.body).toHaveProperty("color", categoryData.color);

    // Check if the model function has been called with the right data
    expect(categories.prototype.save).toHaveBeenCalledWith(categoryData);
  });

  test("Should return 401 if unauthorized", async () => {
    const categoryData = { type: "investment", color: "#fcbe44" };

    // Make a simulated POST request to the endpoint corresponding to the creation of a category without authentication cookie
    const response = await request(app)
      .post("/api/categories")
      .send(categoryData);

    // verify if the response is an error of authorization
    expect(response.status).toBe(401);
  });
});

describe("updateCategory", () => {
  test("should update category", async () => {
    const categoryData = { type: "example", color: "blue" };

    // Make a simulated PUT request to the endpoint corresponding to the update of a category
    const response = await request(app)
      .put("/api/categories")
      .send(categoryData);

    // verify if the response is correct ( status HTTP 200 , message of confirmation )
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Category updated");
    expect(response.body).toHaveProperty("count");

    // Check if the model function has been called with the right data
    expect(categories.prototype.save).toHaveBeenCalledWith(categoryData);
  });

  test("should return 401 if category does not exist ", async () => {
    const categoryData = { type: "nonexistent", color: "blue" };

    // Make a simulated PUT request to the endpoint corresponding to the update of a non-existent category
    const response = await request(app)
      .put("/api/categories")
      .send(categoryData);

    // verify if the response is an error of autorization ( status HTTP 401)
    expect(response.status).toBe(401);
  });

  test("Should return 401 if parameters are invalid", async () => {
    const categoryData = { type: "example", color: "invalid" };

    // Make a simulated PUT request to the endpoint corresponding to the update of a category with invalid parameters
    const response = await request(app)
      .put("/api/categories")
      .send(categoryData);

    // verify if the response is an error of autorization(statut HTTP 401)
    expect(response.status).toBe(401);
  });
});

describe("deleteCategory", () => {
  test("Should delete a category", async () => {
    const categoryId = "example-category-id";

    // Make a simulated DELETE request to the endpoint corresponding to the deletion of a category
    const response = await request(app).delete(`/api/categories/${categoryId}`);

    // Check if the response is correct (HTTP 200 status, confirmation message and counter returned)
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Category deleted");
    expect(response.body).toHaveProperty("count");

    // Check if the template function has been called with the corresponding category ID
    expect(categories.deleteOne).toHaveBeenCalledWith({ _id: categoryId });
  });

  test("Should return 404 if category does not exist", async () => {
    const categoryId = "nonexistent-category-id";

    // Make a simulated DELETE request to the endpoint corresponding to the deletion of a non-existent category
    const response = await request(app).delete(`/api/categories/${categoryId}`);

    // Check if the response is a resource not found error (HTTP status 404)
    expect(response.status).toBe(404);
  });
});

describe("getCategories", () => {
  test("Should return all categories", async () => {
    const mockCategories = [
      { type: "category1", color: "red" },
      { type: "category2", color: "blue" },
      { type: "category3", color: "green" },
    ];

    // Configure the template function to return the simulated categories
    categories.find.mockResolvedValue(mockCategories);

    // Make a simulated GET request to the endpoint corresponding to the category retrieval
    const response = await request(app).get("/api/categories");

    // verify if the response is correct

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCategories);

    //Check if the model function has been called
    expect(categories.find).toHaveBeenCalled();
  });

  test("Should return an empty array if no categories exist", async () => {
    // Configure the template function to return an empty array of simulated categories
    categories.find.mockResolvedValue([]);

    // Make a simulated GET request to the endpoint corresponding to the category retrieval
    const response = await request(app).get("/api/categories");

    // verify if the response is correct
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // Check if the model function has been called
    expect(categories.find).toHaveBeenCalled();
  });
});

describe("createTransaction", () => {
  test("Should create a new transaction", async () => {
    const mockTransaction = {
      id: "12345",
      amount: 100,
      category: "food",
      date: "2023-05-17",
    };

    const mockRequestBody = {
      amount: 100,
      category: "food",
      date: "2023-05-17",
    };

    // Configure the model function to return the saved simulated transaction
    transactions.prototype.save.mockResolvedValue(mockTransaction);

    // Make a simulated POST request to the endpoint corresponding to the creation of a transaction
    const response = await request(app)
      .post("/api/transactions")
      .send(mockRequestBody);

    // verify if the response is correct
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTransaction);

    // Check if the model function has been called with the right parameters
    expect(transactions.prototype.save).toHaveBeenCalledWith(mockRequestBody);
  });

  test("Should return an error if required fields are missing", async () => {
    const mockRequestBody = {
      amount: 100,
      // category is missing
      date: "2023-05-17",
    };

    // Make a simulated POST request to the endpoint corresponding to the creation of a transaction
    const response = await request(app)
      .post("/api/transactions")
      .send(mockRequestBody);

    // verify if the response is an error of validation ( status 400 , error message sent )
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");

    // Vérifiez si la fonction du modèle n'a pas été appelée
    expect(transactions.prototype.save).not.toHaveBeenCalled();
  });
});

describe("getAllTransactions", () => {
  test("Should retrieve all transactions", async () => {
    const mockTransactions = [
      { id: "1", amount: 100, category: "1", date: "D1" },
      { id: "2", amount: 200, category: "2", date: "D2" },
      { id: "3", amount: 50, category: "3", date: "D3" },
    ];

    // Configure the model function to return simulated transactions
    transactions.find.mockResolvedValue(mockTransactions);

    // Make a simulated GET request to the endpoint corresponding to the recovery of all transactions
    const response = await request(app).get("/api/transactions");

    // verify if the response is correct(status HTTP 200, transactions retrieved)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTransactions);

    // Check if the model function has been called without parameters
    expect(transactions.find).toHaveBeenCalledWith({});
  });

  test("Should return an empty array if no transactions found", async () => {
    const mockEmptyTransactions = [];

    // Configure the template function to return an empty array
    transactions.find.mockResolvedValue(mockEmptyTransactions);

    // Make a simulated GET request to the endpoint corresponding to the recovery of all transactions
    const response = await request(app).get("/api/transactions");

    // verify if the response is correct (status HTTP 200, empty array returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // Check if the model function has been called without parameters
    expect(transactions.find).toHaveBeenCalledWith({});
  });
});

describe("getTransactionsByUser", () => {
  test("Should retrieve transactions by user ID", async () => {
    const userId = "123456";
    const mockTransactions = [
      {
        id: "1",
        amount: 100,
        category: "food",
        date: "2023-05-17",
        userId: "123456",
      },
      {
        id: "2",
        amount: 200,
        category: "transportation",
        date: "2023-05-18",
        userId: "123456",
      },
      {
        id: "3",
        amount: 50,
        category: "shopping",
        date: "2023-05-19",
        userId: "123456",
      },
    ];

    // Configure the model function to return simulated transactions
    transactions.find.mockResolvedValue(mockTransactions);

    // Make a simulated GET request to the endpoint corresponding to the retrieval of transactions by user ID
    const response = await request(app).get(`/api/transactions/user/${userId}`);

    // Check if the response is correct (HTTP status 200, transactions returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTransactions);

    // Check if the template function has been called with the user ID as a query parameter
    expect(transactions.find).toHaveBeenCalledWith({ userId });
  });

  test("Should return an empty array if no transactions found for the user", async () => {
    const userId = "123456";
    const mockEmptyTransactions = [];

    // Configure the template function to return an empty table
    transactions.find.mockResolvedValue(mockEmptyTransactions);

    // Make a simulated GET request to the endpoint corresponding to the retrieval of transactions by user ID
    const response = await request(app).get(`/api/transactions/user/${userId}`);

    // Check if the response is correct (HTTP status 200, empty table returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // Check if the template function has been called with the user ID as a query parameter
    expect(transactions.find).toHaveBeenCalledWith({ userId });
  });
});

describe("getTransactionsByUserByCategory", () => {
  test("Should retrieve transactions by user ID and category", async () => {
    const userId = "123456";
    const category = "food";
    const mockTransactions = [
      {
        id: "1",
        amount: 100,
        category: "food",
        date: "2023-05-17",
        userId: "123456",
      },
      {
        id: "2",
        amount: 200,
        category: "food",
        date: "2023-05-18",
        userId: "123456",
      },
    ];

    // Configure the model function to return simulated transactions
    transactions.find.mockResolvedValue(mockTransactions);

    // Make a simulated GET request to the corresponding endpoint to retrieve transactions by user ID and category
    const response = await request(app).get(
      `/api/transactions/user/${userId}/category/${category}`
    );

    // Check if the response is correct (HTTP status 200, transactions returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTransactions);

    // Check if the template function was called with the user ID and category as query parameters
    expect(transactions.find).toHaveBeenCalledWith({ userId, category });
  });

  test("Should return an empty array if no transactions found for the user and category", async () => {
    const userId = "123456";
    const category = "food";
    const mockEmptyTransactions = [];

    // Configure the template function to return an empty table
    transactions.find.mockResolvedValue(mockEmptyTransactions);

    // Make a simulated GET request to the corresponding endpoint to retrieve transactions by user ID and category
    const response = await request(app).get(
      `/api/transactions/user/${userId}/category/${category}`
    );

    // Check if the response is correct (HTTP status 200, empty table returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // Check if the template function was called with the user ID and category as query parameters
    expect(transactions.find).toHaveBeenCalledWith({ userId, category });
  });
});

describe("getTransactionsByGroup", () => {
  test("Should retrieve transactions by group ID", async () => {
    const groupId = "123456";
    const mockTransactions = [
      {
        id: "1",
        amount: 100,
        category: "food",
        date: "2023-05-17",
        groupId: "123456",
      },
      {
        id: "2",
        amount: 200,
        category: "rent",
        date: "2023-05-18",
        groupId: "123456",
      },
    ];

    // Configure the model function to return simulated transactions
    transactions.find.mockResolvedValue(mockTransactions);

    // Make a simulated GET request to the endpoint corresponding to the retrieval of transactions by group ID
    const response = await request(app).get(
      `/api/transactions/group/${groupId}`
    );

    // Check if the response is correct (HTTP status 200, transactions returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTransactions);

    // Check if the template function has been called with the group ID as a query parameter
    expect(transactions.find).toHaveBeenCalledWith({ groupId });
  });

  test("Should return an empty array if no transactions found for the group", async () => {
    const groupId = "123456";
    const mockEmptyTransactions = [];

    // Configure the template function to return an empty table
    transactions.find.mockResolvedValue(mockEmptyTransactions);

    // Make a simulated GET request to the endpoint corresponding to the retrieval of transactions by group ID
    const response = await request(app).get(
      `/api/transactions/group/${groupId}`
    );

    // Check if the response is correct (HTTP status 200, empty table returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // Check if the template function has been called with the group ID as a query parameter
    expect(transactions.find).toHaveBeenCalledWith({ groupId });
  });
});

describe("getTransactionsByGroupByCategory", () => {
  test("Should retrieve transactions by group ID and category", async () => {
    const groupId = "123456";
    const category = "food";
    const mockTransactions = [
      {
        id: "1",
        amount: 100,
        category: "food",
        date: "2023-05-17",
        groupId: "123456",
      },
      {
        id: "2",
        amount: 200,
        category: "food",
        date: "2023-05-18",
        groupId: "123456",
      },
    ];

    // Configure the model function to return simulated transactions
    transactions.find.mockResolvedValue(mockTransactions);

    // Make a simulated GET request to the endpoint corresponding to the retrieval of transactions by group ID and category
    const response = await request(app).get(
      `/api/transactions/group/${groupId}/category/${category}`
    );

    // Check if the response is correct (HTTP status 200, transactions returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTransactions);

    // Check if the template function was called with the group ID and category as query parameters
    expect(transactions.find).toHaveBeenCalledWith({ groupId, category });
  });

  test("Should return an empty array if no transactions found for the group and category", async () => {
    const groupId = "123456";
    const category = "food";
    const mockEmptyTransactions = [];

    // Configure the template function to return an empty table
    transactions.find.mockResolvedValue(mockEmptyTransactions);

    // Make a simulated GET request to the endpoint corresponding to the retrieval of transactions by group ID and category
    const response = await request(app).get(
      `/api/transactions/group/${groupId}/category/${category}`
    );

    // Check if the response is correct (HTTP status 200, empty table returned)
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // Check if the template function was called with the group ID and category as query parameters
    expect(transactions.find).toHaveBeenCalledWith({ groupId, category });
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
