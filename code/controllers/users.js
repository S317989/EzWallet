import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ error: "Unauthorized" });

    const users = (await User.find()).map((user) => {
      return {
        username: user.username,
        email: user.email,
        role: user.role,
      };
    });
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json(error.message);
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

    if (userAuth.authorized) {
      //User auth successful
      const user = await User.findOne({ username: req.params.username });

      if (user.refreshToken !== req.cookies.refreshToken)
        return res.status(401).json({ error: "Unauthorized" });

      if (!user) return res.status(400).json({ error: "User not found" });

      return res.status(200).json({
        data: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });

      if (adminAuth.authorized) {
        //Admin auth successful

        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(401).json({ error: "User not found" });

        return res.status(200).json({
          data: {
            username: user.username,
            email: user.email,
            role: user.role,
          },
        });
      } else {
        return res.status(400).json({ error: adminAuth.message });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!verifyAuth(req, res, { authType: "Simple" }).authorized)
      return res.status(401).json({ error: "Unauthorized" });

    const groupName = req.body.name;

    // if the group already exists
    if (await Group.findOne({ groupName }))
      return res.status(400).json({ error: "Group already exists" });

    let usersNotFound = [],
      alreadyInGroup = [],
      newGroupMembers = [],
      membersList = req.body.memberEmails,
      user,
      checkInGroup = false;

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

    if (newGroupMembers.length === 0)
      return res.status(400).json({
        data: {
          error: `All the users [${membersList}] either don't exist or are already in a group!`,
        },
      });

    const newGroup = await Group.create({
      name: groupName,
      members: newGroupMembers,
    }).save();

    res.status(200).json({
      data: {
        group: newGroup,
        alreadyInGroup: alreadyInGroup,
        membersNotFound: usersNotFound,
      },
    });
  } catch (err) {
    res.status(500).json(err.message);
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
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ error: "Unauthorized" });

    const groups = (await Group.find()).map((group) => {
      return {
        name: group.name,
        members: group.members,
      };
    });

    res.status(200).json({ data: groups });
  } catch (err) {
    res.status(500).json(err.message);
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
        data: { error: `The group '${req.params.name}' doesn't exist!` },
      });

    if (verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(200).json({
        data: {
          name: groupInfo.name,
          members: groupInfo.members,
        },
      });
    else {
      const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
      });

      if (!user) return res.status(401).json({ error: "Unauthorized" });

      let isInGroup = groupInfo.members.find(
        (member) => member.email === user.username
      );

      if (!isInGroup) return res.status(401).json({ error: "Unauthorized" });

      return res.status(200).json({
        data: {
          name: groupInfo.name,
          members: groupInfo.members,
        },
      });
    }
  } catch (err) {
    res.status(500).json(err.message);
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
      return res.status(400).json({ error: "Group does not exist" });

    // if the user is not an admin, it means that he is a regular user, so we need to check if he is in the group
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized) {
      const userInfo = await User.findOne({
        refreshToken: req.cookies.refreshToken,
      });

      const isInGroup = searchedGroup.members.find(
        (member) => member.email === userInfo.username
      );

      if (!userInfo || !isInGroup)
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Either the user is an admin or a regular user, he is authorized to add members to the group
    const oldMemberList = [...searchedGroup.members],
      memberEmails = req.body.newMembers,
      membersNotFound = [],
      alreadyInGroup = [];

    let user;

    for (let email of memberEmails) {
      user = await User.findOne({ email });
      if (!user) membersNotFound.push(email);
      else if (searchedGroup.members.some((member) => member.email === email))
        alreadyInGroup.push(email);
      else searchedGroup.members.push(user);
    }

    if (searchedGroup.members.every((user) => oldMemberList.includes(user)))
      return res.status(400).json({
        data: {
          error: `The specified [${oldMemberList}] members either do not exist or are already in a group`,
        },
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
    });
  } catch (err) {
    res.status(500).json(err.message);
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
      return res.status(400).json({ error: "Group does not exist" });

    // if the user is not an admin, it means that he is a regular user, so we need to check if he is in the group
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized) {
      const userInfo = await User.findOne({
        refreshToken: req.cookies.refreshToken,
      });

      const isInGroup = searchedGroup.members.find(
        (member) => member.email === userInfo.username
      );

      if (!userInfo || !isInGroup)
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Either the user is an admin or a regular user, he is authorized to add members to the group
    const removingEmails = req.body.users,
      notInGroup = [],
      usersNotFound = [],
      oldMemberList = [...searchedGroup.members];

    let user;

    for (let email of removingEmails) {
      user = await User.findOne({ email });

      if (!user) usersNotFound.push(email);
      else if (!searchedGroup.members.some((member) => member.email === email))
        notInGroup.push(email);
      else searchedGroup.members.remove(user);
    }

    if (oldMemberList.every((member) => searchedGroup.members.includes(member)))
      return res.status(400).json({
        error: `The specified [${oldMemberList}] members either do not exist or are not in the specified group!`,
      });

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
    });
  } catch (err) {
    res.status(500).json(err.message);
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
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).json({ error: "The user doesn't exist" });

    /* Removing transaction related to the user */
    const deletedTrx = await transactions.deleteMany({
      username: user.username,
    });

    /* Removing User from the group -> cover the case that the user is in multiple group (extreme) */
    let InGroup = false;
    const groupslist = (await Group.find())
      .filter((ans) =>
        ans.members.some((member) => member.email === user.email)
      )
      .forEach(async (group) => {
        InGroup = true;
        group.members.forEach((m) => {
          m.email === user.email ? group.members.remove(m) : null;
        });
        await group.save();
      });

    /** Effective user removing */
    await User.deleteOne(user);

    return res.status(200).json({
      data: {
        deletedTransactions: deletedTrx.deletedCount,
        deletedFromGroup: InGroup,
      },
    });
  } catch (err) {
    res.status(500).json(err.message);
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
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ error: "Unauthorized" });

    const groupName = req.body.name;
    const groupDeleted = await Group.findOne({ name: groupName });

    if (!groupDeleted)
      return res
        .status(400)
        .json({ error: `The group ${groupName} doesn't exist!` });

    await Group.deleteOne(groupDeleted);

    return res.status(200).json({
      data: { error: `Group ${groupName} cancelled with success!` },
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
