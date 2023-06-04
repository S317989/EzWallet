import e from "express";
import jwt from "jsonwebtoken";

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a User user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req) => {
  let { date, from, upTo } = req.query;

  if (date && (from || upTo))
    throw new Error("Date cannot be with from or upTo");

  // return error if date is in not format YYYY-MM-DD
  if (date && !date.match(/^\d{4}-\d{2}-\d{2}$/))
    throw new Error("Date must be in format YYYY-MM-DD");

  let filter = {
    date: {},
  };

  if (date) {
    filter.date = { $gte: new Date(req.query["date"]) };
  } else {
    /** Date must be alone, without from and upTo */
    if (from) filter.date.$gte = new Date(req.query["from"]);

    if (upTo) {
      const upToDate = new Date(req.query["upTo"]);
      upToDate.setHours(23);
      upToDate.setMinutes(59);

      filter.date.$lte = upToDate;
    }
  }

  return filter;
};

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a User user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req, data) => {
  let { minAmount, maxAmount } = req.query;

  let filter = {
    amount: {},
  };

  if (minAmount) {
    if (isNaN(minAmount)) throw new Error("Min amount must be a number");

    filter.amount.$gte = parseInt(minAmount);
  }
  if (maxAmount) {
    if (isNaN(maxAmount)) throw new Error("Max amount must be a number");

    filter.amount.$lte = parseInt(maxAmount);
  }
  return filter;
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
    return { flag: false, cause: "Unauthorized" };
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
      return { flag: false, cause: "Token is missing information" };
    }

    if (
      !decodedRefreshToken.username ||
      !decodedRefreshToken.email ||
      !decodedRefreshToken.role
    ) {
      return { flag: false, cause: "Token is missing information" };
    }
    if (
      decodedAccessToken.username !== decodedRefreshToken.username ||
      decodedAccessToken.email !== decodedRefreshToken.email ||
      decodedAccessToken.role !== decodedRefreshToken.role
    ) {
      return { flag: false, cause: "Mismatched users" };
    }

    return checkRolesPermissions(
      res,
      decodedAccessToken,
      decodedRefreshToken,
      info
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

        let newDecodedAccessToken = jwt.verify(
          newAccessToken,
          process.env.ACCESS_KEY
        );

        return checkRolesPermissions(
          res,
          newDecodedAccessToken,
          refreshToken,
          info
        );
      } catch (err) {
        if (err.name === "TokenExpiredError")
          return { flag: false, cause: "Perform login again" };
        else return { flag: false, cause: err.name };
      }
    } else {
      return { flag: false, cause: err.name };
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
  res,
  decodedAccessToken,
  decodedRefreshToken,
  info
) => {
  console.log(decodedAccessToken);

  console.log(info.emails.includes(decodedAccessToken.email));  

  switch (info.authType) {
    case "Admin":
      if (
        decodedAccessToken.role !== "Admin" ||
        decodedRefreshToken.role !== "Admin" ||
        (!decodedAccessToken && decodedRefreshToken.role !== "Admin")
      )
        return { flag: false, cause: "Mismatched users" };

      break;
    case "Simple":
      return { flag: true, cause: "Authorized" };
      break;
    case "User":
      if (
        decodedAccessToken.role !== "Regular" ||
        decodedRefreshToken.role !== "Regular" ||
        (!decodedAccessToken && decodedRefreshToken.role !== "Regular")
      )
        return { flag: false, cause: "Mismatched users" };

      break;
    case "Group":
      if (decodedAccessToken.role === "Admin")
        return { flag: true, cause: "Authorized" };
      else if (
        decodedAccessToken.role !== "Admin" &&
        !info.emails.includes(decodedAccessToken.email)
      )
        return { flag: false, cause: "User not in group" };

      break;
    default:
      return { flag: true, cause: "Authorized" };
  }

  return { flag: true, cause: "Authorized" };
};

export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
};
