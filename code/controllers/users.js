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
export const getUsers = async (req, res) => { //Check if the mMAP functions works properly also with an empty array !!
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const users = (await User.find())/*.map((user)=>{   //-> Use MAP functions to obtain only the information that are necessary
      return {username: user.username,                  //-> Without it's the more general cases, usefull to program and see all
        email: user.email,                              //-> the info related to all users !!
        role: user.role}
    })*/;
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
export const getUser = async (req, res) => { //Error while doing authentication here due to multiple cases
  try {
    const userAuth = verifyAuth(req, res, {
      authType: "User",
      username: req.params.username,
    });

    if (userAuth.authorized) {
      //User auth successful
      const user = await User.findOne({ username: req.params.username });

      if (user.refreshToken !== req.cookies.refreshToken)
        return res.status(401).json({ message: "Unauthorized" });

      if (!user) return res.status(400).json({ message: "User not found" });

      return res.status(200).json({ 
        data:{
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (adminAuth.authorized) {
        //Admin auth successful

        const user = await User.findOne({ refreshToken: cookie.refreshToken });
        if (!user) return res.status(401).json({ message: "User not found" });

        return res.status(200).json({
          data:{
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      } else {
        return res.status(401).json({ error: adminAuth.message });
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
  try {   /* TO TEST IT -> use as body parameter: "name"  &  "memberEmails" ! (as written in the upper comment)*/
    if (!verifyAuth(req, res, { authType: "Simple" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const name = req.body.name;

    // if the group already exists
    if (await Group.findOne({ name }))
      return res.status(400).json({ message: "Group already exists" });

    const userNotFound = [];
    const alreadyInGroup = [];
    const newGroupMembers = [];

    const membersList = req.body.memberEmails;
    //if all members exist and are not already in a group
    let user;
    let checkInGroup = false;

    for (let member of membersList) {
      user = await User.findOne({ email: member });

      if (!user) userNotFound.push(member.email);
      else {
        checkInGroup = await Group.findOne({
          members: { $elemMatch: { email: member } },
        });

        checkInGroup
          ? alreadyInGroup.push(member.email)
          : newGroupMembers.push(user);
      }
    }

    if (newGroupMembers.length === 0) {
      return res.status(400).json({
        data: [],
        message: "All the user either don't exist or are already in a group !",
      });
    }
    // create new group and add members to it
    const newGroup = await Group.create({
      name: name,
      members: newGroupMembers,
    });
    await newGroup.save();
    //  /*response data content*/

    const responseData = {
      group: newGroup,
      alreadyInGroup: alreadyInGroup,
      membersNotFound: userNotFound,
    };

    res.status(200).json({ data: responseData });
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
export const getGroups = async (req, res) => { //Check if a NON-Admin user can't use it !!
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const groups = (await Group.find()).map((group)=>{
      return {
        name: group.name,
        members: group.members
      }
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
export const getGroup = async (req, res) => {//Check if a NON-Admin user can only obtain the info about his group !!
  try {
    const cookie = req.cookies;
    if (!cookie.accessToken || !cookie.refreshToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }

    const groupName = req.params.name;
    const groupInfo = await Group.findOne({ name: groupName });
    console.log(groupInfo);
    if (!groupInfo) return res.status(400).json(`${groupName} doesn't exist !`);

    return res.status(200).json({
      data: {
        name: groupName,
        members: groupInfo.members,
      },
    });
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
export const addToGroup = async (req, res) => { //Add the cookies check + role check !!->different behavior between User & Admin !!
  try {
    const existingGroup = await Group.findOne({ name: req.params.name });
    if (!existingGroup)
      return res.status(400).json({ message: "Group does not exist" });

    const oldMemberList = [...existingGroup.members];
    const memberEmails = req.body.newMembers;

    const membersNotFound = [];
    const alreadyInGroup = [];

    for (let email of memberEmails) {
      let user = await User.findOne({ email });
      if (!user) membersNotFound.push(email);
      else if (existingGroup.members.some((member) => member.email === email))
        alreadyInGroup.push(email);
      else existingGroup.members.push(user);
    }

    if (existingGroup.members.every((user) => oldMemberList.includes(user))) {
      return res.status(400).json({
        data: [],
        message:
          "The specified members either do not exist or are already in a group",
      });
    }

    await existingGroup.save();

    res.status(200).json({
      data: {
        group: {
          name: existingGroup.name,
          members: existingGroup.members
        },
        alreadyInGroup,
        membersNotFound,
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
export const removeFromGroup = async (req, res) => { //Add the cookies check + role check !! -> different behavior between User & Admin !!
  try {
    const modifiedGroup = await Group.findOne({ name: req.params.name });
    if (!modifiedGroup) {
      return res.status(400).json({ message: "Group does not exist" });
    }

    const removingEmails = req.body.users;
    const notInGroup = [];
    const usersNotFound = [];
    const oldMemberList = [...modifiedGroup.members];

    for (let email of removingEmails) {
      let user = await User.findOne({ email });

      if (!user) usersNotFound.push(email);
      else if (!modifiedGroup.members.some((member) => member.email === email))
        notInGroup.push(email);
      else modifiedGroup.members.remove(user);
    }

    if (oldMemberList.every((user) => modifiedGroup.members.includes(user))) {
      return res.status(400).json({
        message:
          "The specified members either do not exist or are not in the specified group!",
      });
    }
    await modifiedGroup.save();

    res.status(200).json({
      data: {
        group: {
          name: modifiedGroup.name,
          members: modifiedGroup.members
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
      return res.status(401).json({ message: "Unauthorized" });

    const groupName = req.body.name;
    const groupDeleted = await Group.findOne({ name: groupName });

    if (!groupDeleted) {
      return res
        .status(400)
        .json({ message: `The group ${groupName} doesn't exist!` });
    }

    await Group.deleteOne(groupDeleted);
    res.status(200).json({
      data: [],
      message: `Group ${groupName} cancelled with success!`,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
