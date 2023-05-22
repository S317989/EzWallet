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
- [ ] Controller.js
  - [x] UpdateCategory
  - [x] DeleteCategory
  - [x] GetTransactionByUser
  - [x] GetTransactionByUserByCategory
  - [x] GetTransactionByGroup
  - [x] GetTransactionByGroupByCategory
  - [x] DeleteTransactions
- [ ] Users
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

- Methods testing by Postman
