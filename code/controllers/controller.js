import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import {
  handleDateFilterParams,
  handleAmountFilterParams,
  verifyAuth,
} from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = (req, res) => {
  try {
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    const { type, color } = req.body;
    const new_categories = new categories({ type, color });

    new_categories
      .save()
      .then((result) =>
        res.json({
          data: {
            type: result.type,
            color: result.color,
          },
        })
      )
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const oldCategoryType = req.params.type;

    // Check if transaction have oldCategoryType
    if (!(await categories.findOne({ type: oldCategoryType })))
      return res.status(400).json({
        data: { message: `Category ${oldCategoryType} doesn't exists` },
      });

    const { type, color } = req.body;

    if (!(await categories.findOne({ type: type })))
      return res
        .status(400)
        .json({ data: { message: `Category ${type} doesn't exists` } });

    let newCategory = await categories.findOneAndUpdate(
      { type: oldCategoryType },
      { $set: { type: type, color: color } }
    );

    return res.status(200).json({
      data: {
        message: `Category ${oldCategoryType} updated to ${newCategory} successfully`,
        count: await transactions.countDocuments({
          type: oldCategoryType,
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const categoriesToDelete = req.body.types;

    let result = await categories.find({
      type: { $in: categoriesToDelete },
    });

    if (!result)
      return res.status(400).json({
        data: {
          message: `Categories ${categoriesToDelete} don't exist`,
        },
      });

    const foundCat = result.map((cat) => cat.type);

    const notFoundCat = categoriesToDelete.filter(
      (cat) => !foundCat.includes(cat)
    );

    await categories.deleteMany({ type: { $in: foundCat } });

    return res.status(200).json({
      data: {
        message:
          notFoundCat === 0
            ? `Categories ${foundCat} successfully deleted!`
            : `Categories ${foundCat} successfully deleted! Categories ${notFoundCat} not found!`,
        count: await transactions.countDocuments({
          type: { $in: foundCat },
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!verifyAuth(req, res, { authType: "Simple" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    let data = await categories.find({});

    let catList = data.map((v) =>
      Object.assign({}, { type: v.type, color: v.color })
    );

    return res.status(200).json({ data: catList });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!verifyAuth(req, res, { authType: "Simple" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const cookie = req.cookies;
    if (!cookie.accessToken)
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized

    let usernameParam = req.params.username;
    const { username, amount, type } = req.body;

    console.log(usernameParam, username);

    if (usernameParam !== username)
      return res
        .status(400)
        .json({ message: "Username values are not equivalent" });

    if (
      !(await User.findOne({ username: username })) ||
      !(await categories.findOne({ type: type }))
    )
      return res.status(400).json({
        data: {
          message: `Username ${username} or category ${type} doesn't exist`,
        },
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
        })
      )
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    /**
     * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
     */
    return res
      .status(200)
      .json({ data: await getTransactionsDetails(req, res, null) });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
          if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
            return res.status(401).json({ message: "Unauthorized" });

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
            return res.status(400).json({ message: "User not found" });

          if (req.params.username)
            filter = { $and: [{ username: req.params.username }] };

          return res
            .status(200)
            .json({ data: await getTransactionsDetails(req, res, filter) });
        })()
      : (async () => {
          if (
            !verifyAuth(req, res, {
              authType: "User",
              username: req.params.username,
            }).authorized
          )
            return res.status(401).json({ message: "Unauthorized" });

          /** Wait till checking user existing */
          await User.findOne({
            username: req.params.username,
          }).then((data) => {
            username = data;
          });

          /** If user not found */
          if (username === null)
            return res.status(400).json({ message: "User not found" });

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

          return res
            .status(200)
            .json({ data: await getTransactionsDetails(req, res, filter) });
        })();
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    req.url.includes("/transactions/users/")
      ? (async () => {
          if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
            return res.status(401).json({ message: "Unauthorized" });

          filter = {
            $and: [
              { username: req.params.username },
              { type: req.params.category },
            ],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res
            .status(200)
            .json({ data: await getTransactionsDetails(req, res, filter) });
        })()
      : (async () => {
          let user = await User.findOne({ username: req.params.username });

          if (
            !verifyAuth(req, res, {
              authType: "User",
              username: req.params.username,
            }).authorized ||
            user.refreshToken !== req.cookies.refreshToken
          )
            return res.status(401).json({ message: "Unauthorized" });

          filter = {
            $and: [
              { username: req.params.username },
              { type: req.params.category },
            ],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res
            .status(200)
            .json({ data: await getTransactionsDetails(req, res, filter) });
        })();
  } catch (error) {
    res.status(500).json({ error: error.message });
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
          if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
            return res.status(401).json({ message: "Unauthorized" });

          // Trova il gruppo desiderato
          const group = await Group.findOne({ name: req.params.name });

          if (!group)
            return res.status(400).json({ message: "Group not found" });

          // Estrai gli ID degli utenti associati ai membri del gruppo
          const memberUserIds = group.members.map((member) => member.email);

          /* // Filtra le transazioni in base agli ID degli utenti
          const transactionList = await transactions.find({
            username: { $in: memberUserIds },
            group: group._id,
          });

          // Restituisci le transazioni filtrate come risultato
          return res.status(200).json({ data: transactionList });*/

          filter = {
            $and: [{ username: { $in: memberUserIds } }],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
          });
        })()
      : (async () => {
          let groupSearched = await Group.findOne({ name: req.params.name });

          if (!groupSearched)
            return res.status(400).json({ message: "Group not found" });

          let membersEmail = groupSearched.members.map(
            (member) => member.email
          );

          if (
            !verifyAuth(req, res, {
              authType: "Group",
              emails: membersEmail,
            }).authorized
          )
            return res.status(401).json({ message: "Unauthorized" });

          /*// Filtra le transazioni in base agli ID degli utenti
          const transactionList = await transactions.find({
            username: { $in: membersEmail },
            group: groupSearched._id,
          });

          // Restituisci le transazioni filtrate come risultato
          return res.status(200).json({ data: transactionList });*/

          filter = {
            $and: [{ username: { $in: membersEmail } }],
          };

          // Remove the null element
          filter.$and = filter.$and.filter((condition) => condition !== null);

          return res.status(200).json({
            data: await getTransactionsDetails(req, res, filter),
          });
        })();
  } catch (error) {
    res.status(500).json({ error: error.message });
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
          if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
            return res.status(401).json({ message: "Unauthorized" });

          // Trova il gruppo desiderato
          const group = await Group.findOne({ name: req.params.name });

          if (!group)
            return res.status(400).json({ message: "Group not found" });

          const category = await categories.findOne({
            type: req.params.category,
          });

          if (!category)
            return res.status(400).json({ message: "Category not found" });

          // Estrai gli ID degli utenti associati ai membri del gruppo
          const memberUserIds = group.members.map((member) => member.email);

          filter = {
            $and: [
              { username: { $in: memberUserIds } },
              { type: category.type },
            ],
          };

          return res
            .status(200)
            .json({ data: await getTransactionsDetails(req, res, filter) });
        })()
      : (async () => {
          let groupSearched = await Group.findOne({ name: req.params.name });

          if (!groupSearched)
            return res.status(400).json({ message: "Group not found" });

          const category = await categories.findOne({
            type: req.params.category,
          });

          if (!category)
            return res.status(400).json({ message: "Category not found" });

          let membersEmail = groupSearched.members.map(
            (member) => member.email
          );

          if (
            !verifyAuth(req, res, {
              authType: "Group",
              emails: membersEmail,
            }).authorized
          )
            return res.status(401).json({ message: "Unauthorized" });

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

          return res
            .status(200)
            .json({ data: await getTransactionsDetails(req, res, filter) });
        })();
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    // Check if the transaction exists
    let transactionToBeDeleted = await transactions.findOne({
      _id: req.body._id,
    });

    if (!transactionToBeDeleted)
      return res
        .status(400)
        .json({ message: `Transaction ${req.body._id} not found` });

    if (verifyAuth(req, res, { authType: "Admin" }).authorized) {
      // Delete the transaction where id = req.body._id and username = req.params.username
      await transactions.deleteOne({ _id: req.body._id });

      return res.status(200).json({
        data: { message: `Transaction ${req.body._id} successfully deleted` },
      });
    } else if (verifyAuth(req, res, { authType: "User" }).authorized) {
      const user = await User.findOne({ username: req.params.username });

      // Check if the user is the owner of the transaction
      if (
        user.refreshToken !== req.cookies.refreshToken ||
        transactionToBeDeleted.username !== req.params.username
      )
        return res.status(401).json({ message: "Unauthorized" });

      await transactions.deleteOne({ _id: req.body._id });

      return res.status(200).json({
        data: { message: `Transaction ${req.body._id} successfully deleted` },
      });
    } else return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!verifyAuth(req, res, { authType: "Admin" }).authorized)
      return res.status(401).json({ message: "Unauthorized" });

    let transactionIds = req.body._ids;

    let result = await transactions.find({
      _id: { $in: transactionIds },
    });

    if (!result)
      return res.status(400).json({
        data: {
          message: `Transaction ${transactionIds} don't exist`,
        },
      });

    const foundTrans = result.map((transaction) => transaction._id.toString());

    const notFoundTrans = transactionIds.filter(
      (transaction) => !foundTrans.includes(transaction)
    );

    await transactions.deleteMany({ _id: { $in: foundTrans } });

    return res.status(200).json({
      data: {
        message:
          notFoundTrans.length === 0
            ? `Transactions ${foundTrans} successfully deleted`
            : `Transactions ${foundTrans} successfully deleted! Transactions ${notFoundTrans} not found!`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransactionsDetails = async (req, res, filter) => {
  // Esegui l'aggregazione senza la fase di $match se il filtro è vuoto
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

  // Aggiungi la fase di $match solo se il filtro non è vuoto
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
