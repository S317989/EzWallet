import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth, validateEmail } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    const users = (await User.find()).map((user) => {
      return {
        username: user.username,
        email: user.email,
        role: user.role,
      };
    });

    return res.status(200).json({
      data: users,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 400 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const userAuth = verifyAuth(req, res, {
      authType: "User",
      username: req.params.username,
    });

    if (userAuth.flag) {
      //User auth successful
      const user = await User.findOne({ username: req.params.username });

      if (!user)
        return res.status(400).json({
          error: "User not found",
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });

      if (user.refreshToken !== req.cookies.refreshToken)
        return res.status(400).json({
          error: "Unauthorized",
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });

      return res.status(200).json({
        data: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });

      if (adminAuth.flag) {
        const user = await User.findOne({ username: req.params.username });

        if (!user)
          return res.status(400).json({
            error: "User not found",
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });

        return res.status(200).json({
          data: {
            username: user.username,
            email: user.email,
            role: user.role,
          },
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
      } else {
        return res.status(401).json({ error: adminAuth.cause });
      }
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    does not appear in the system)
  - Optional behavior:
    - error 400 is returned if there is already an existing group with the same name
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Simple" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    const groupName = req.body.name;

    if (!req.body.name || !req.body.memberEmails)
      return res.status(400).json({
        error: "Missing parameters",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    // if the group already exists
    if (await Group.findOne({ name: groupName }))
      return res.status(400).json({
        error: "Group already exists",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    let usersNotFound = [],
      alreadyInGroup = [],
      newGroupMembers = [],
      membersList = req.body.memberEmails,
      user,
      checkInGroup = false;

    const userCaller = await User.findOne({
      refreshToken: req.cookies.refreshToken,
    });

    if (
      await Group.findOne({
        members: { $elemMatch: { email: userCaller.email } },
      })
    )
      return res.status(400).json({
        error: "User already in a group",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (!membersList.includes(userCaller.email))
      membersList.push(userCaller.email);

    if (!membersList.every((member) => validateEmail(member)))
      return res.status(400).json({
        error: "Invalid email format",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    for (let member of membersList) {
      user = await User.findOne({ email: member });

      if (!user) usersNotFound.push(member.email);
      else {
        checkInGroup = await Group.findOne({
          members: { $elemMatch: { email: member } },
        });

        checkInGroup
          ? alreadyInGroup.push(member.email)
          : newGroupMembers.push(user);
      }
    }

    // One member is just the caller
    if (newGroupMembers.length === 1)
      return res.status(400).json({
        error: `All the users [${membersList}] either don't exist or are already in a group!`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const newGroup = await Group.create({
      name: groupName,
      members: newGroupMembers,
    });

    await newGroup.save();

    return res.status(200).json({
      data: {
        group: newGroup,
        alreadyInGroup: alreadyInGroup,
        membersNotFound: usersNotFound,
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    const groups = (await Group.find()).map((group) => {
      return {
        name: group.name,
        members: group.members,
      };
    });

    res.status(200).json({
      data: groups,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {
    const groupInfo = await Group.findOne({ name: req.params.name });

    if (!groupInfo)
      return res.status(400).json({
        error: `The group '${req.params.name}' doesn't exist!`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(200).json({
        data: {
          name: groupInfo.name,
          members: groupInfo.members,
        },
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });
    else {
      
      const userAuth = verifyAuth(req, res, {
        authType: "Group",
        emails: groupInfo.members.map((member) => member.email),
      });

      if (userAuth.flag) {
        const user = await User.findOne({
          refreshToken: req.cookies.refreshToken,
        });

        if (!user)
          return res.status(400).json({
            error: "User not found",
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });

        let isInGroup = groupInfo.members.find(
          (member) => member.email === user.email
        );

        if (!isInGroup)
          return res.status(400).json({
            error: "User not in the specified group",
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });

        return res.status(200).json({
          data: {
            name: groupInfo.name,
            members: groupInfo.members,
          },
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
      } else {
        return res.status(401).json({ error: userAuth.cause });
      }
    }
  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
  try {
    const searchedGroup = await Group.findOne({ name: req.params.name });

    if (!searchedGroup)
      return res.status(400).json({
        error: "Group does not exist",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const memberEmails = req.body.emails;
    const oldMemberList = [...searchedGroup.members],
      membersNotFound = [],
      alreadyInGroup = [];

    if (!memberEmails || memberEmails.length === 0)
      return res.status(400).json({
        error: "No emails provided",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (req.url.includes("/insert")) {
      if (!verifyAuth(req, res, { authType: "Admin" }).flag)
        return res.status(401).json({ error: "Unauthorized" });
    } else {
      if (
        !verifyAuth(req, res, {
          authType: "Group",
          emails: oldMemberList.map((ans) => ans.email),
        }).flag
      ) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    let user;

    if (!memberEmails.every((email) => validateEmail(email)))
      return res.status(400).json({
        error: "Invalid email format",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    for (let email of memberEmails) {
      user = await User.findOne({ email });

      if (!user) membersNotFound.push(email);
      else {
        let groupToCheck = await Group.findOne({
          members: { $elemMatch: { email: email } },
        });

        if (groupToCheck) alreadyInGroup.push(email);
        else searchedGroup.members.push(user);
      }
    }

    if (searchedGroup.members.every((user) => oldMemberList.includes(user)))
      return res.status(400).json({
        error: `The specified ${memberEmails} users either do not exist or are already in a group`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    await searchedGroup.save();

    return res.status(200).json({
      data: {
        group: {
          name: searchedGroup.name,
          members: searchedGroup.members,
        },
        alreadyInGroup: alreadyInGroup,
        membersNotFound: membersNotFound,
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Remove members from a group
  - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
    const searchedGroup = await Group.findOne({ name: req.params.name });

    if (!searchedGroup)
      return res.status(400).json({
        error: "Group does not exist",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    let removingEmails = req.body.emails;

    if (!removingEmails || removingEmails.length === 0)
      return res.status(400).json({
        error: "No emails provided",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (!removingEmails.every((email) => validateEmail(email)))
      return res.status(400).json({
        error: "Invalid email format",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const oldMemberList = [...searchedGroup.members];

    if (oldMemberList.length === 1)
      return res.status(400).json({
        error: "You cannot remove all the members from a group",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (req.url.includes("/pull")) {
      if (!verifyAuth(req, res, { authType: "Admin" }).flag)
        return res.status(401).json({ error: "Unauthorized" });
    } else {
      if (
        !verifyAuth(req, res, {
          authType: "Group",
          emails: oldMemberList.map((ans) => ans.email),
        }).flag
      )
        return res.status(401).json({ error: "Unauthorized" });
    }

    const notInGroup = [],
      usersNotFound = [];

    let user;

    const existingUsers = await User.find({
      email: { $in: removingEmails },
    });

    // return error if all the emails doesn't exist
    if (!existingUsers.length)
      return res.status(400).json({
        error: "Invalid or non-existing emails",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (
      searchedGroup.members.every(
        (user) => !removingEmails.includes(user.email)
      )
    )
      return res.status(400).json({
        error: "All the members are not in the group",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    // Add into notInGroup the emails that are not in the group but are into remainingEmails
    const oldEmails = oldMemberList.map((member) => member.email);

    for (let email of removingEmails) {
      user = await User.findOne({ email });

      if (!user) usersNotFound.push(email);

      if (user && !oldEmails.includes(email)) notInGroup.push(email);

      searchedGroup.members = searchedGroup.members.filter(
        (member) => !removingEmails.includes(member.email)
      );
    }

    if (searchedGroup.members.length === 0)
      searchedGroup.members.push(oldMemberList[0]);

    await searchedGroup.save();

    return res.status(200).json({
      data: {
        group: {
          name: searchedGroup.name,
          members: searchedGroup.members,
        },
        notInGroup: notInGroup,
        membersNotFound: usersNotFound,
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 400 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    if (!req.body.email)
      return res.status(400).json({
        error: "No email provided",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (!validateEmail(req.body.email))
      return res.status(400).json({
        error: "Invalid email format",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(400).json({
        error: "The user doesn't exist",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (user.role === "Admin")
      return res.status(400).json({
        error: "You can't delete an admin",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    /* Removing transaction related to the user */
    const deletedTrx = await transactions.deleteMany({
      username: user.username,
    });

    const group = await Group.findOneAndUpdate(
      { "members.email": user.email },
      { $pull: { members: { email: user.email } } },
      { new: true }
    );

    let InGroup = false;

    if (group) InGroup = true;

    if (group && group.members.length === 0) await Group.deleteOne(group);

    /** Effective user removing */
    await User.deleteOne(user);

    return res.status(200).json({
      data: {
        deletedTransactions: deletedTrx.deletedCount,
        deletedFromGroup: InGroup,
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    if (!req.body.name)
      return res.status(400).json({
        error: "No group name provided",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const groupName = req.body.name;
    const groupDeleted = await Group.findOne({ name: groupName });

    if (!groupDeleted)
      return res.status(400).json({
        error: `The group ${groupName} doesn't exist!`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    await Group.deleteOne(groupDeleted);

    return res.status(200).json({
      data: { message: `Group ${groupName} cancelled with success!` },
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};
