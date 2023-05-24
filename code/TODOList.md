TODO List of the things that must be done

Pre-Conditions to be checked:
- Check the user role for each method (admin can do something that normal user cannot)
- Remember to check the token at the start of the method

- [x] Check if all the developed methods work properly
- [x] Roles Problems 
  - [x] createCategory role to be checked
  - [x] getUsers role to be checked
  - [x] getAllTransactions role to be checked
  - [x] registerAdmin role to be checked
- [ ] Unit Tests
  - [ ] Auth
  - [ ] Controller
  - [ ] Users
  - [ ] Utils
- [ ] Integration tests
  - [ ] Auth
  - [ ] Controller
  - [ ] Users
  - [ ] Utils
- [x] Controller.js
  - [x] UpdateCategory
  - [x] DeleteCategory
  - [x] GetTransactionByUser
  - [x] GetTransactionByUserByCategory
  - [x] GetTransactionByGroup
  - [x] GetTransactionByGroupByCategory
  - [x] DeleteTransactions
- [x] Users
  - [x] createGroup
  - [x] getGroups
  - [x] getGroup
  - [x] addToGroup
  - [x] removeFromGroup
  - [x] deleteUser
  - [x] deleteGroup
- [x] Utils
  - [x] handleDataFilterParams
  - [x] handleAmountFilterParams

To be checked:
  - [x] Check the request specifically for the createGroup -> All his special cases !!!
  - [x] Admin checks, on the methods that can be performed only by ADMIN !!
  - [x] Cookies checks, on the methods that can performed only by authenticated users !!

- Rules Definitions
  - [x] Regular user can only delete their own transactions (the transaction id must be the same as the request id)
  - [x] DeleteCategory can delete more than one category 
  - [x] DeleteCategory must return an error if there is at lest one category not found 
  - [x] DeleteCategory - at least one category must remain in the database after deletion (3 remained --> 3 to be deleted --> the first category in DB will remain)
  - [x] All the transactions that have a category that is deleted, must have a category changed to the first category type or default one.
  - [x] CreateTransaction - method receives username from body and params and must be equals.
  - [x] If the user who calls createGroup is not in the passed array, it must be included in the insertion.
  - [x] A group must have at least one member, so the first one cannot be removed.
  - [x] Return error if the function is called when the group contains only one user.
  - [x] The error messages must be inside "Error" attribute and not "Message"
  - [x] If a user is deleted, all his transactions must be deleted.
  - [x] DeleteCategories and DeleteTransactions body must be ad object with an array inside (id for transaction and type for categries).
  - [x] If at least one element in the array is not present, must return error and no element is deleted.
  
Method testing: 
- [ ] General
  - [ ] Register
  - [ ] RegisterAdmin
  - [ ] Login
- [ ] User
  - [ ] GetCategories
  - [ ] GetUser
  - [ ] CreateTransaction
  - [ ] GetTransactionByUser
  - [ ] DeleteTransaction
  - [ ] GetTransactionByUserByCategory
  - [ ] CreateGroup
  - [ ] GetGroup
  - [ ] GetTransactionByGroup
  - [ ] GetTransactionByGroupByCategory
  - [ ] AddToGroup
  - [ ] RemoveFromGroup
- [ ] Admin
  - [ ] CreateCategory
  - [ ] UpdateCategory
  - [ ] DeleteCategory
  - [ ] GetAllTransactions
  - [ ] DeleteTransactions
  - [ ] GetTransactionsByUser
  - [ ] GetTransactionsByUserByCategory
  - [ ] GetTransactionsByGroup
  - [ ] GetTransactionsByGroupByCategory
  - [ ] GetUsers
  - [ ] DeleteGroup
  - [ ] AddToGroup
  - [ ] RemoveFromG
 