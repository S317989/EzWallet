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
    if (!verifyAuth(req, res, "Admin"))
      return res.status(401).json({ message: "Unauthorized" });

    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    const { type, color } = req.body;
    const new_categories = new categories({ type, color });
    new_categories
      .save()
      .then((data) => res.json(data))
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
  try {
    if (!verifyAuth(req, res, "Admin"))
      return res.status(401).json({ message: "Unauthorized" });

    const oldCategoryType = req.params.type;

    const { type, color } = req.body;

    if (!(await categories.findOne({ type: type })))
      return res.status(401).json({ message: "Unauthorized" });

    const updatedCategory = await categories.findOneAndUpdate(
      { type: oldCategoryType },
      { $set: { type: type, color: color } }
    );

    return res.status(200).json({
      message: "Category updated successfully",
      count: await transactions.countDocuments({
        type: oldCategoryType,
      }),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
  try {
    if (!verifyAuth(req, res, "Admin")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const categoryToDelete = req.body;

    if (!(await categories.findOne({ type: categoryToDelete }))) {
      return res
        .status(401)
        .json({ message: `Category ${category} don't exist !` });
    }

    return res.status(200).json({
      message: `Category ${categoryToDelete} successfully deleted !`,
      count: transactions.countDocuments({
        type: categoryToDelete,
      }),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    let data = await categories.find({});

    let filter = data.map((v) =>
      Object.assign({}, { type: v.type, color: v.color })
    );

    return res.json(filter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    let username = req.params.username;
    const { amount, type } = req.body;

    const new_transactions = new transactions({ username, amount, type });
    new_transactions
      .save()
      .then((data) => res.json(data))
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    if (!verifyAuth(req, res, "Admin"))
      return res.status(401).json({ message: "Unauthorized" });

    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    /**
     * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
     */
    getTransactionsDetails(req, res).catch((error) => {
      throw error;
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
  try {
    let username,
      filter = null,
      dateFilter = {},
      amountFilter = {};

    /** Using of ternary condition, equals to if() else () */
    req.url.includes("/transactions/users/")
      ? (async () => {
          if (!verifyAuth(req, res, "Admin"))
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
            return res.status(401).json({ message: "User not found" });

          if (req.params.username)
            filter = { $and: [{ username: req.params.username }] };

          return res
            .status(200)
            .json(await getTransactionsDetails(req, res, filter));
        })()
      : (async () => {
          if (!verifyAuth(req, res, "Regular"))
            return res.status(401).json({ message: "Unauthorized" });

          /** Wait till checking user existing */
          await User.findOne({
            username: req.params.username,
          }).then((data) => {
            username = data;
          });

          /** If user not found */
          if (username === null)
            return res.status(401).json({ message: "User not found" });

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
            .json(await getTransactionsDetails(req, res, filter));
        })();
  } catch (error) {
    res.status(400).json({ error: error.message });
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
          if (!verifyAuth(req, res, "Admin"))
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
            .json(await getTransactionsDetails(req, res, filter));
        })()
      : (async () => {
          let user = await User.findOne({ username: req.params.username });

          if (
            !verifyAuth(req, res, "Regular") ||
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
            .json(await getTransactionsDetails(req, res, filter));
        })();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
  try {
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    let data = await transactions.deleteOne({ _id: req.body._id });
    return res.json("deleted");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ error: error.message });
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

  if (filter != null && filter.$and.length > 0) {
    // Aggiungi la fase di $match solo se il filtro non è vuoto
    aggregationPipeline.unshift({ $match: filter });
  }

  return await transactions.aggregate(aggregationPipeline).then((result) => {
    let data = result.map((v) =>
      Object.assign(
        {},
        {
          _id: v._id,
          username: v.username,
          amount: v.amount,
          type: v.type,
          color: v.categories_info.color,
          date: v.date,
        }
      )
    );

    res.json(data);
  });
};
