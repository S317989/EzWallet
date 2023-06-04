import request from "supertest";
import { app } from "../app";
import { Group, User } from "../models/User.js";
import * as verifyAuth from "../controllers/utils.js";
import * as usersMethods from "../controllers/users.js";

jest.mock("../models/User.js");

let mockRequest, mockResponse;

beforeEach(() => {
  User.find.mockClear();
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
    User.find.mockResolvedValueOnce([
      { username: "caller", email: "caller@email.com", role: "Regular" },
    ]);

    Group.findOne.mockResolvedValue(false);

    Group.create.mockResolvedValue({
      name: "Group1",
      members: mockRequest.body.memberEmails,
    });

    jest.spyOn(Group.prototype, "save").mockResolvedValue({
      name: "Group1",
      members: mockRequest.body.memberEmails,
    });

    await usersMethods.createGroup(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "Group1",
          members: mockRequest.body.memberEmails,
        },
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

    jest.spyOn(Group.prototype, "save").mockResolvedValue({
      name: "Group1",
      members: mockRequest.body.membersEmails,
    });
  });
});

describe("getGroups", () => {});

describe("getGroup", () => {});

describe("addToGroup", () => {});

describe("removeFromGroup", () => {});

describe("deleteUser", () => {});

describe("deleteGroup", () => {});
