import jwt from "jsonwebtoken";

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req, data) => {
  let { date, from, upTo } = req.query;
  const queryKey = Object.keys(req.query);
  const queryValue = req.query[queryKey];

  if (date && (from || upTo)) {
    throw new Error(
      "Cannot use date parameter together with from or upTo parameters"
    );
  }

  switch (queryKey.toString()) {
    case "date":
      date = date.substring(date.indexOf('"') + 1, date.lastIndexOf('"'));

      if (queryValue.includes("gt"))
        data = data.filter((t) => t.date >= new Date(date));
      else if (queryValue.includes("lt"))
        data = data.filter((t) => t.date <= new Date(date));
      else
        data = data.filter(
          (t) =>
            new Date(t.date).toDateString() === new Date(date).toDateString()
        );

      break;
    case "from":
      data = data.filter((t) => t.date >= new Date(from));

      break;
    case "upTo":
      data = data.filter((t) => t.date <= new Date(upTo));

      break;
  }

  return data;
};

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req, data) => {
  const queryKey = Object.keys(req.query);
  const queryValue = req.query[queryKey];

  const amount = queryValue.substring(queryValue.indexOf(" ") + 1);

  if (queryValue.includes("gt")) data = data.filter((t) => t.amount >= amount);
  else if (queryValue.includes("lt"))
    data = data.filter((t) => t.amount <= amount);
  else data = data.filter((t) => t.amount == amount);

  return data;
};

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */

export const verifyAuth = (req, res, info) => {
  const cookie = req.cookies;
  if (!cookie.accessToken || !cookie.refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  try {
    const decodedAccessToken = jwt.verify(
      cookie.accessToken,
      process.env.ACCESS_KEY
    );
    const decodedRefreshToken = jwt.verify(
      cookie.refreshToken,
      process.env.ACCESS_KEY
    );
    if (
      !decodedAccessToken.username ||
      !decodedAccessToken.email ||
      !decodedAccessToken.role
    ) {
      res.status(401).json({ message: "Token is missing information" });
      return false;
    }
    if (
      !decodedRefreshToken.username ||
      !decodedRefreshToken.email ||
      !decodedRefreshToken.role
    ) {
      res.status(401).json({ message: "Token is missing information" });
      return false;
    }
    if (
      decodedAccessToken.username !== decodedRefreshToken.username ||
      decodedAccessToken.email !== decodedRefreshToken.email ||
      decodedAccessToken.role !== decodedRefreshToken.role
    ) {
      res.status(401).json({ message: "Mismatched users" });
      return false;
    }
    return checkRolesPermissions(
      decodedAccessToken,
      decodedRefreshToken,
      info,
      res
    );
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        const refreshToken = jwt.verify(
          cookie.refreshToken,
          process.env.ACCESS_KEY
        );
        const newAccessToken = jwt.sign(
          {
            username: refreshToken.username,
            email: refreshToken.email,
            id: refreshToken.id,
            role: refreshToken.role,
          },
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          path: "/api",
          maxAge: 60 * 60 * 1000,
          sameSite: "none",
          secure: true,
        });
        res.locals.message =
          "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls";
        return true;
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          res.status(401).json({ message: "Perform login again" });
        } else {
          res.status(401).json({ message: err.name });
        }
        return false;
      }
    } else {
      res.status(401).json({ message: err.name });
      return false;
    }
  }
};

/**
 *  Method that contains all the checking roles needed by verifyAuth. (In order to have a clear code)
 *      Additional criteria:
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 */

const checkRolesPermissions = (
  decodedAccessToken,
  decodedRefreshToken,
  info,
  res
) => {
  switch (info.accessToken) {
    case "Admin":
      if (
        decodedAccessToken.role !== "Admin" ||
        decodedRefreshToken.role !== "Admin" ||
        (!decodedAccessToken && decodedRefreshToken.role !== "Admin")
      ) {
        res.status(401).json({ message: "Unauthorized" });
        return false;
      }
      break;
    case "User":
      if (
        decodedAccessToken.username !== "User" ||
        decodedRefreshToken.username !== "User" ||
        (!decodedAccessToken && decodedRefreshToken.username !== "User")
      ) {
        res.status(401).json({ message: "Unauthorized" });
        return false;
      }
      break;
    case "Group":
      if (
        decodedAccessToken.email !== info.group ||
        (!decodedAccessToken && decodedRefreshToken.email !== info.group)
      ) {
        res.status(401).json({ message: "Unauthorized" });
        return false;
      }
      break;
    default:
      return true;
  }
};
