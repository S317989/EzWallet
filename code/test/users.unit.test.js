import request from "supertest";
import { app } from "../app";
import { Group, User } from "../models/User.js";
import * as verifyAuth from "../controllers/utils.js";
import * as usersMethods from "../controllers/users.js";
import { transactions } from "../models/model";

const moduleToTest = require("../models/User.js");

// Crea una copia del modulo reale
const moduleMock = { ...moduleToTest };

let mockRequest, mockResponse;

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("getUsers", () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      cause: "Authorized",
    });

    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("GetUsers - Success with filled list", async () => {
    User.find.mockResolvedValue([
      { username: "user1", email: "user1@email.com", role: "Regular" },
      { username: "user2", email: "user2@email.com", role: "Regular" },
    ]);

    await usersMethods.getUsers(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: [
        {
          username: "user1",
          email: "user1@email.com",
          role: "Regular",
        },
        {
          username: "user2",
          email: "user2@email.com",
          role: "Regular",
        },
      ],
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("GetUsers - Success with empty list", async () => {
    User.find.mockResolvedValue([]);

    await usersMethods.getUsers(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: [],
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("GetUsers - Unauthorized", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: false,
      cause: "Unauthorized",
    });

    User.find.mockResolvedValue([
      { username: "user1", email: "user1@email.com", role: "Regular" },
      { username: "user2", email: "user2@email.com", role: "Regular" },
    ]);

    await usersMethods.getUsers(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });
});

describe("getUser", () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      cause: "Authorized",
    });

    mockRequest = {
      params: { username: "user1" },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  describe("Admin", () => {
    beforeEach(() => {
      jest.clearAllMocks();

      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: false,
        cause: "Unauthorized",
        role: "User",
      });

      jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
        flag: true,
        cause: "Authorized",
        role: "Admin",
      });
    });

    test("GetUser - Success", async () => {
      User.findOne.mockResolvedValue({
        username: "user1",
        email: "user1@email.com",
        role: "Regular",
      });

      await usersMethods.getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: {
          username: "user1",
          email: expect.stringMatching(/@/),
          role: "Regular",
        },
        refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
      });
    });

    test("GetUser - User not found", async () => {
      User.findOne.mockResolvedValue(null);

      await usersMethods.getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/User not found/),
        refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
      });
    });
  });

  describe("Regular", () => {
    test("GetUser - Success", async () => {
      User.findOne.mockResolvedValue({
        username: "user1",
        email: "user1@email.com",
        role: "Regular",
        refreshToken: "refreshToken",
      });

      await usersMethods.getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: {
          username: "user1",
          email: expect.stringMatching(/@/),
          role: "Regular",
        },
        refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
      });
    });

    test("GetUser - User not found", async () => {
      User.findOne.mockResolvedValue(null);

      await usersMethods.getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/User not found/),
        refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
      });
    });

    test("GetUser - Unauthorized", async () => {
      User.findOne.mockResolvedValue({
        username: "user1",
        role: "Regular",
      });

      await usersMethods.getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/Unauthorized/),
        refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
      });
    });
  });
});

describe("createGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      cause: "Authorized",
    });

    mockRequest = {
      body: {
        name: "Group1",
        memberEmails: ["user1@email.com", "user2@email.com"],
      },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("CreateGroup - Success", async () => {
    moduleMock.User.findOne = jest
      .fn()
      .mockResolvedValueOnce({
        username: "User",
        password: "User",
        email: "user@example.com",
        role: "Regular",
      })
      .mockResolvedValueOnce({
        username: "User",
        password: "User",
        email: "user@example.com",
        role: "Regular",
      })
      .mockResolvedValueOnce({
        username: "User2",
        password: "User2",
        email: "user2@example.com",
        role: "Regular",
      })
      .mockResolvedValueOnce({
        username: "User3",
        password: "User3",
        email: "user3@example.com",
        role: "Regular",
      })
      .mockResolvedValue({ undefined });

    moduleMock.Group.findOne = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(undefined);

    const createMock = jest.spyOn(Group, "create");

    createMock.mockImplementationOnce((data) => {
      return {
        name: "Group1",
        members: data.members,
        save: jest.fn().mockResolvedValueOnce({}),
      };
    });

    await usersMethods.createGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        group: expect.objectContaining({
          name: "Group1",
          members: expect.arrayContaining([
            expect.objectContaining({ email: "user@example.com" }),
            expect.objectContaining({ email: "user2@example.com" }),
            expect.objectContaining({ email: "user3@example.com" }),
          ]),
        }),
        alreadyInGroup: [],
        membersNotFound: [],
      },
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("CreateGroup - Unauthorized", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
      flag: false,
      cause: "Unauthorized",
      role: "User",
    });

    await usersMethods.createGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Unauthorized/),
    });
  });

  test("CreateGroup - Missing parameters", async () => {
    delete mockRequest.body.name;

    await usersMethods.createGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Missing parameters/),
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("CreateGroup - Group already exists", async () => {
    moduleMock.Group.findOne = jest.fn().mockResolvedValueOnce(true);

    await usersMethods.createGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/Group already exists/),
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("CreateGroup - User already in a group", async () => {
    moduleMock.User.findOne = jest
      .fn()
      .mockResolvedValueOnce({
        username: "User",
        password: "User",
        email: "user@example.com",
        role: "Regular",
      })
      .mockResolvedValueOnce({
        username: "User",
        password: "User",
        email: "user@example.com",
        role: "Regular",
      })
      .mockResolvedValueOnce({
        username: "User2",
        password: "User2",
        email: "user2@example.com",
        role: "Regular",
      })
      .mockResolvedValueOnce({
        username: "User3",
        password: "User3",
        email: "user3@example.com",
        role: "Regular",
      })
      .mockResolvedValue({ undefined });

    moduleMock.Group.findOne = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(true)
      .mockResolvedValue(undefined);

    await usersMethods.createGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/User already in a group/),
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });
});

describe("getGroups", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      cause: "Authorized",
    });

    mockRequest = {
      body: {
        name: "Group1",
        memberEmails: ["user1@email.com", "user2@email.com"],
      },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("GetUsers - Success", async () => {
    const mockGroups = [
      {
        name: "Group1",
        members: [
          { email: "user1@example.com", id: "1" },
          { email: "user2@example.com", id: "2" },
        ],
      },
      {
        name: "Group2",
        members: [
          { email: "user3@example.com", id: "3" },
          { email: "user4@example.com", id: "4" },
        ],
      },
    ];

    jest.spyOn(Group, "find").mockResolvedValueOnce(mockGroups);

    await usersMethods.getGroups(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockGroups.map((group) => ({
        name: group.name,
        members: group.members,
      })),
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("GetUsers - Unauthorized", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
      flag: false,
      cause: "Unauthorized",
    });

    await usersMethods.getGroups(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });
});

describe("getGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      cause: "Authorized",
    });

    mockRequest = {
      params: {
        name: "Group1",
      },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("GetGroup - Group doesn't exist", async () => {
    moduleMock.Group.findOne = jest.fn().mockResolvedValueOnce(undefined);

    await usersMethods.getGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringMatching(
        `The group '${mockRequest.params.name}' doesn't exist!`
      ),
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });
});

describe("addToGroup", () => {});

describe("removeFromGroup", () => {});

describe("deleteUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      cause: "Authorized",
    });

    mockRequest = {
      body: {
        email: "user@example.com",
      },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("DeleteUser - Success", async () => {
    const email = "user@example.com";

    const mockUser = {
      email: "user@example.com",
      role: "User",
      username: "mockuser",
    };

    const mockGroup = {
      name: "Group1",
      members: [
        { email: "user@example.com", username: "mockuser" },
        { email: "anotheruser@example.com", username: "anotheruser" },
      ],
      save: jest.fn().mockResolvedValue(),
    };

    jest.spyOn(User, "findOne").mockResolvedValueOnce(mockUser); // Simulate the situation where the group doesn't exist
    jest
      .spyOn(transactions, "deleteMany")
      .mockResolvedValueOnce({ deletedCount: 5 }); // Simulate the situation where the group doesn't exist
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValueOnce(mockGroup); // Simulate the situation where the group doesn't exist
    jest.spyOn(User, "deleteOne").mockResolvedValueOnce(mockUser); // Simulate the situation where the group doesn't exist

    await usersMethods.deleteUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        deletedTransactions: 5,
        deletedFromGroup: true,
      },
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("DeleteUser - Unauthorized", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
      flag: false,
      cause: "Unauthorized",
    });

    await usersMethods.deleteUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("DeleteUser - No email provided", async () => {
    delete mockRequest.body.email;

    await usersMethods.deleteUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "No email provided",
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("DeleteUser - Invalid email format", async () => {
    mockRequest.body.email = "test";

    await usersMethods.deleteUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Invalid email format",
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("DeleteUser - User not found", async () => {
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null);

    await usersMethods.deleteUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "The user doesn't exist",
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("DeleteUser - Admin not removable", async () => {
    const email = "admin@example.com";

    const mockAdminUser = {
      email,
      role: "Admin",
    };

    jest.spyOn(User, "findOne").mockResolvedValueOnce(mockAdminUser);

    await usersMethods.deleteUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "You can't delete an admin",
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });
});

describe("deleteGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValue({
      flag: true,
      cause: "Authorized",
    });

    mockRequest = {
      body: {
        name: "Group1",
        memberEmails: ["user1@email.com", "user2@email.com"],
      },
      cookies: {
        refreshToken: "refreshToken",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "refreshedTokenMessage" },
    };
  });

  test("DeleteGroup - Success", async () => {
    const mockGroup = {
      name: "Group1",
    };

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(mockGroup);
    jest.spyOn(Group, "deleteOne").mockResolvedValueOnce();

    await usersMethods.deleteGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: { message: `Group Group1 cancelled with success!` },
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("DeleteGroup - Unauthorized", async () => {
    jest.spyOn(verifyAuth, "verifyAuth").mockReturnValueOnce({
      flag: false,
      cause: "Unauthorized",
    });

    await usersMethods.deleteGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("DeleteGroup - Missing group name", async () => {
    delete mockRequest.body.name;

    await usersMethods.deleteGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "No group name provided",
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });

  test("DeleteGroup - Group doesn't exist", async () => {
    const groupName = "Group1";

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null);

    await usersMethods.deleteGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: `The group ${groupName} doesn't exist!`,
      refreshedTokenMessage: mockResponse.locals.refreshedTokenMessage,
    });
  });
});
