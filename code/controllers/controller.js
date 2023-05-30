import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import {
  handleDateFilterParams,
  handleAmountFilterParams,
  verifyAuth,
  validateEmail,
} from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    const { type, color } = req.body;

    if (!type || !color)
      return res.status(400).json({
        error: "Missing or empty parameters",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const alreadyExists = await categories.findOne({ type });

    if (alreadyExists)
      return res.status(400).json({
        error: "Category already exists",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const new_categories = new categories({ type, color });

    new_categories
      .save()
      .then((result) =>
        res.status(200).json({
          data: {
            type: result.type,
            color: result.color,
          },
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        })
      )
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 400 returned if the specified category does not exist
    - error 400 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    const oldCategoryType = req.params.type;

    // Check if transaction have oldCategoryType
    if (!(await categories.findOne({ type: oldCategoryType })))
      return res.status(400).json({
        error: `Category ${oldCategoryType} doesn't exists`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const { type, color } = req.body;

    if (!type || !color)
      return res.status(400).json({
        error: "Missing or empty parameters",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (type != oldCategoryType && (await categories.findOne({ type: type })))
      return res.status(400).json({
        error: `Category ${type} already exists`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    let newCategory = await categories.findOneAndUpdate(
      { type: oldCategoryType },
      { $set: { type: type, color: color } }
    );

    return res.status(200).json({
      data: {
        message: `Category ${oldCategoryType} updated to [${type}, ${newCategory.color}] successfully`,
        count: await transactions.countDocuments({
          type: oldCategoryType,
        }),
      },
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
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 400 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    const categoriesToDelete = req.body.types;

    if (!categoriesToDelete || categoriesToDelete.length == 0)
      return res.status(400).json({
        error: "Missing or empty parameters",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (categoriesToDelete.some((cat) => cat === ""))
      return res.status(400).json({
        error: "Empty string in types array",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    let categoriesList = await categories.find();

    if (categoriesList.length == 1)
      return res.status(400).json({
        error: "No categories can be deleted",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    let result = await categories.find({
      type: { $in: categoriesToDelete },
    });

    if (!result)
      return res.status(400).json({
        error: `Categories ${categoriesToDelete} don't exist`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    let foundCat = result.map((cat) => cat.type);

    const notFoundCat = categoriesToDelete.filter(
      (cat) => !foundCat.includes(cat)
    );

    if (notFoundCat.length > 0)
      return res.status(400).json({
        error: `Categories [${notFoundCat}] don't exist, cannot procede with deletion`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (categoriesToDelete.length === categoriesList.length)
      foundCat = foundCat.filter(
        (cat) => !cat.includes(categoriesList[0].type)
      );

    await categories.deleteMany({ type: { $in: foundCat } });

    // Update transaction where type is in foundCat and set type to categoriesList[0].type
    await transactions.updateMany(
      { type: { $in: foundCat } },
      { $set: { type: categoriesList[0].type } }
    );

    return res.status(200).json({
      data: {
        message: `Categories ${foundCat} successfully deleted!`,
        count: await transactions.countDocuments({
          type: { $in: foundCat },
        }),
      },
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
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Simple" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    let data = await categories.find({});

    let catList = data.map((v) =>
      Object.assign({}, { type: v.type, color: v.color })
    );

    return res.status(200).json({
      data: catList,
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
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 400 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Simple" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    let usernameParam = req.params.username;
    const { username, amount, type } = req.body;

    if (!username || !amount || !type)
      return res.status(400).json({
        error: "Missing or empty parameters",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (isNaN(parseFloat(amount)))
      return res.status(400).json({
        error: "Amount is not a number",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (usernameParam !== username)
      return res.status(400).json({
        error: "Username values are not equivalent",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (
      !(await User.findOne({ username: username })) ||
      !(await categories.findOne({ type: type }))
    )
      return res.status(400).json({
        error: `Username ${username} or category ${type} doesn't exist`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const new_transactions = new transactions({ username, amount, type });
    new_transactions
      .save()
      .then((result) =>
        res.status(200).json({
          data: {
            username: result.username,
            type: result.type,
            amount: result.amount,
            data: result.date,
          },
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        })
      )
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    return res.status(200).json({
      data: await getTransactionsDetails(req, res, null),
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
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 400 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a User user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
  try {
    let username,
      filter = null;

    /** Using of ternary condition, equals to if() else () */
    req.url.includes("/transactions/users/")
      ? (async () => {
          if (!verifyAuth(req, res, { authType: "Admin" }).flag)
            return res.status(401).json({ error: "Unauthorized" });

          /** If url contains username param  */
          if (Object.keys(req.params).includes("username")) {
            /** Wait till checking user existing */
            await User.findOne({
              username: req.params.username,
            }).then((data) => {
              username = data;
            });
          }

          /** If user not found */
          if (username === null)
            return res.status(400).json({
              error: "User not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          if (req.params.username)
            filter = { $and: [{ username: req.params.username }] };

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })()
      : (async () => {
          const user = await User.findOne({ username: req.params.username });

          if (
            !verifyAuth(req, res, {
              authType: "User",
              username: req.params.username,
            }).flag ||
            user.refreshToken !== req.cookies.refreshToken
          )
            return res.status(401).json({ error: "Unauthorized" });

          /** Wait till checking user existing */
          await User.findOne({
            username: req.params.username,
          }).then((data) => {
            username = data;
          });

          /** If user not found */
          if (username === null)
            return res.status(400).json({
              error: "User not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          const dateIncludes = ["date", "from", "upTo"];

          if (dateIncludes.some((v) => Object.keys(req.query).includes(v)))
            dateFilter = handleDateFilterParams(req);

          const amountIncludes = ["minAmount", "maxAmount"];
          if (amountIncludes.some((v) => Object.keys(req.query).includes(v)))
            amountFilter = handleAmountFilterParams(req);

          const filter = {
            $and: [
              { username: req.params.username },
              ...(dateIncludes.some((v) => Object.keys(req.query).includes(v))
                ? [handleDateFilterParams(req)]
                : []),
              ...(amountIncludes.some((v) => Object.keys(req.query).includes(v))
                ? [handleAmountFilterParams(req)]
                : []),
            ],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })();
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 401 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
  try {
    let filter;

    if (!(await User.findOne({ username: req.params.username })))
      return res.status(400).json({
        error: "User not found",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    if (!(await categories.findOne({ type: req.params.category })))
      return res.status(400).json({
        error: "Category not found",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    req.url.includes("/transactions/users/")
      ? (async () => {
          if (!verifyAuth(req, res, { authType: "Admin" }).flag)
            return res.status(401).json({ error: "Unauthorized" });

          filter = {
            $and: [
              { username: req.params.username },
              { type: req.params.category },
            ],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })()
      : (async () => {
          let user = await User.findOne({ username: req.params.username });

          if (
            !verifyAuth(req, res, {
              authType: "User",
              username: req.params.username,
            }).flag ||
            user.refreshToken !== req.cookies.refreshToken
          )
            return res.status(401).json({ error: "Unauthorized" });

          filter = {
            $and: [
              { username: req.params.username },
              { type: req.params.category },
            ],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })();
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
  try {
    let filter;
    req.url.includes("/transactions/groups")
      ? (async () => {
          if (!verifyAuth(req, res, { authType: "Admin" }).flag)
            return res.status(401).json({ error: "Unauthorized" });

          // Trova il gruppo desiderato
          const group = await Group.findOne({ name: req.params.name });

          if (!group)
            return res.status(400).json({
              error: "Group not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          // Estrai gli ID degli utenti associati ai membri del gruppo
          const memberUserIds = group.members.map((member) => member.email);

          filter = {
            $and: [{ username: { $in: memberUserIds } }],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })()
      : (async () => {
          let groupSearched = await Group.findOne({ name: req.params.name });

          if (!groupSearched)
            return res.status(400).json({
              error: "Group not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          let membersEmail = groupSearched.members.map(
            (member) => member.email
          );

          if (
            !verifyAuth(req, res, {
              authType: "Group",
              emails: membersEmail,
            }).flag
          )
            return res.status(401).json({ error: "Unauthorized" });

          filter = {
            $and: [{ username: { $in: membersEmail } }],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })();
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 400 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
  try {
    let filter;

    req.url.includes("/transactions/groups")
      ? (async () => {
          if (!verifyAuth(req, res, { authType: "Admin" }).flag)
            return res.status(401).json({ error: "Unauthorized" });

          const group = await Group.findOne({ name: req.params.name });

          if (!group)
            return res.status(400).json({
              error: "Group not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          const category = await categories.findOne({
            type: req.params.category,
          });

          if (!category)
            return res.status(400).json({
              error: "Category not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          const memberUserIds = group.members.map((member) => member.email);

          filter = {
            $and: [
              { username: { $in: memberUserIds } },
              { type: category.type },
            ],
          };

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })()
      : (async () => {
          let groupSearched = await Group.findOne({ name: req.params.name });

          if (!groupSearched)
            return res.status(400).json({
              error: "Group not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          const category = await categories.findOne({
            type: req.params.category,
          });

          if (!category)
            return res.status(400).json({
              error: "Category not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

          let membersEmail = groupSearched.members.map(
            (member) => member.email
          );

          if (
            !verifyAuth(req, res, {
              authType: "Group",
              emails: membersEmail,
            }).flag
          )
            return res.status(401).json({ error: "Unauthorized" });

          // Estrai gli ID degli utenti associati ai membri del gruppo
          const memberUserIds = groupSearched.members.map(
            (member) => member.email
          );

          filter = {
            $and: [
              { username: { $in: memberUserIds } },
              { type: category.type },
            ],
          };

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });
        })();
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 40 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
  try {
    if (!req.body._id)
      return res.status(400).json({
        error: "Missing _ids",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    // Check if the transaction exists
    let transactionToBeDeleted = await transactions.findOne({
      _id: req.body._id,
    });

    if (!transactionToBeDeleted)
      return res.status(400).json({
        error: `Transaction ${req.body._id} not found`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (adminAuth.flag) {
      // Delete the transaction where id = req.body._id and username = req.params.username
      await transactions.deleteOne({ _id: req.body._id });

      return res.status(200).json({
        data: { message: `Transaction ${req.body._id} successfully deleted` },
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });
    } else {
      const userAuth = verifyAuth(req, res, { authType: "User" });

      if (userAuth.flag) {
        const user = await User.findOne({ username: req.params.username });

        if (!user)
          return res
            .status(400)
            .json({
              error: "User not found",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });

        // Check if the user is the owner of the transaction
        if (
          user.refreshToken !== req.cookies.refreshToken ||
          transactionToBeDeleted.username !== req.params.username
        )
          return res.status(400).json({
            error: "The user is not the owner",
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
          });

        await transactions.deleteOne({ _id: req.body._id });

        return res.status(200).json({
          data: { message: `Transaction ${req.body._id} successfully deleted` },
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
      } else return res.status(401).json({ error: userAuth.message });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 400 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).flag)
      return res.status(401).json({ error: "Unauthorized" });

    let transactionIds = req.body._ids;

    if (!transactionIds || transactionIds.length === 0)
      return res
        .status(400)
        .json({
          error: "Missing _ids",
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });

    if (transactionIds.some((id) => id === ""))
      return res
        .status(400)
        .json({
          error: "Empty _ids",
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });

    let result = await transactions.find({
      _id: { $in: transactionIds },
    });

    if (!result)
      return res.status(400).json({
        error: `Transaction ${transactionIds} don't exist`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    const foundTrans = result.map((transaction) => transaction._id.toString());

    const notFoundTrans = transactionIds.filter(
      (transaction) => !foundTrans.includes(transaction)
    );

    if (notFoundTrans.length > 0)
      return res.status(400).json({
        error: `Transactions [${notFoundTrans}] don't exist, cannot procede with deletion`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });

    await transactions.deleteMany({ _id: { $in: foundTrans } });

    return res.status(200).json({
      data: {
        message: `Transactions ${foundTrans} successfully deleted`,
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  }
};

const getTransactionsDetails = async (req, res, filter) => {
  const aggregationPipeline = [
    {
      $lookup: {
        from: "categories",
        localField: "type",
        foreignField: "type",
        as: "categories_info",
      },
    },
    { $unwind: "$categories_info" },
  ];

  if (filter != null && filter.$and.length > 0)
    aggregationPipeline.unshift({ $match: filter });

  const result = await transactions.aggregate(aggregationPipeline);

  const data = result.map((v) =>
    Object.assign(
      {},
      {
        id: v._id,
        username: v.username,
        amount: v.amount,
        type: v.type,
        color: v.categories_info.color,
        date: v.date,
      }
    )
  );

  return data;
};
