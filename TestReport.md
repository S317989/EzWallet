<link rel="stylesheet" type="text/css" media="all" href="./markdownStyle.css" />

# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

![ReportImages](assets/Images/dependency%20graph2.png)

# Integration approach

In our project implementation, we have chosen to adopt a "Bottom-Up Integration" approach as our preferred integration strategy. This approach allows us to initially test the lower-level components, which serve as the foundational building blocks of the system, and gradually progress towards integrating the higher-level units.

Here is the sequence of steps we followed:

| Steps  | Object's argument                                                                                                                                                                                                                       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1 | We initiated the integration process by testing the functionality of the "Authentication" unit to ensure that the entire authentication system operates correctly.                                                                      |
| Step 2 | Subsequently, we proceeded to the "Utils" component, as it serves primarily as a support module for the entire system and its units.                                                                                                    |
| Step 3 | After confirming the functionality of the fundamental units, we conducted tests on the "Users" component to ensure proper management of system users, privileges, and gain a clear understanding of the system actors.                  |
| Step 4 | Finally, we concluded with the integration of the "Controller" unit, which represents the highest and most complex level. We deliberately addressed it last to resolve any issues that may have arisen from the other supporting units. |

Upon completing the aforementioned steps, we conducted Integration Tests of the APIs by utilizing the routes defined in "Route.js". These tests aimed to verify the seamless flow of requests and responses across the various integrated units and components, ensuring the end-to-end functionality of the system.

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

| Test case name | Object(s) tested | Test level | Technique used |
| -------------- | ---------------- | ---------- | -------------- |
|Registration - Success|authMethods.register|Unit|WB - Statement|
|Registration - Exists|authMethods.register|Unit|wb - branches|
|Registration - Invalid Email|authMethods.register|Unit|wb - branches|
|Registration Admin - Success| authMethods.registerAdmin|Unit|WB - Statement|
|Registration Admin - Already Registered|authMethods.registerAdmin|Unit|wb - branches|
|Registration Admin - Invalid Email| authMethods.registerAdmin|Unit|wb - branches|
|Login - Success|authMethods.login|Unit|WB - Statement|
|Login - User Not Registered|authMethods.login|Unit|wb - branches|
|Logout - Success|authMethods.logout|Unit|WB - Statement|
|Logout - Already logged out|authMethods.logout|Unit|wb - branches|
|Logout - User not found|authMethods.logout|Unit|wb - branches|
|getUsers - Success with filled list|usersMethods.getUsers|Unit|wb - Statement|
|getUsers - Success with empty list|usersMethods.getUsers|Unit|wb - Statement|
|getUsers - Unauthorized|usersMethods.getUsers|Unit|wb - branches|
|getUser - Admin - Success|usersMethods.getUser|Unit|wb - Statement|
|getUser - Admin - User not found|usersMethods.getUser|Unit|wb - branches|
|getUser - Regular - Success|usersMethods.getUser|Unit|wb - Statement|
|getUser - Regular - User not found|usersMethods.getUser|Unit|wb - branches|
|getUser - Regular - Unauthorized|usersMethods.getUser|Unit|wb - branches|
|createGroup - Success|usersMethods.createGroup|Unit|wb - Statement|
|createGroup - Unauthorized|usersMethods.createGroup|Unit|wb - branches|
|createGroup - Missing parameters|usersMethods.createGroup|Unit|wb - branches|
|createGroup - Group already exists|usersMethods.createGroup|Unit|wb - branches|
|createGroup - User already in a group|usersMethods.createGroup|Unit|wb - branches|
|getGroups - Success|usersMethods.getGroups|unit|wb - Statement|
|getGroups - Unauthorized|usersMethods.getGroups|unit|wb - Branches|
|getGroup - Group doesn't exist|usersMethods.getGroups|unit|wb - Branches|
|getGroup - Admin - Success|usersMethods.getGroups|unit|wb - Statement|
|getGroup - Admin - Unauthorized|usersMethods.getGroups|unit|wb - Branches|
|DeleteUser - Unauthorized|usersMethods.deleteUser|unit|wb - Branches|
|DeleteUser - No email provided|usersMethods.deleteUse|unit|wb - Branches|
|DeleteUser - Invalid email format|usersMethods.deleteUser|unit|wb - Branches|
|DeleteUser - User not found|usersMethods.deleteUser|unit|wb - Branches|
|DeleteUser - Admin not removable|usersMethods.deleteUser|unit|wb - Branches|
|DeleteGroup - Success|usersMethods.deleteUser|unit|wb - Statement|
|DeleteGroup - Unauthorized|usersMethods.deleteUser|unit|wb - Statement|
|DeleteGroup - Missing group name|usersMethods.deleteUser|unit|wb - Statement|
|DeleteGroup - Group doesn't exist|usersMethods.deleteUser|unit|wb - Statement|
|HandleDateFilterParams - upTo and from cannot be together|utilsMethods.handleDateFilterParams()|unit|Exception handling|
|HandleDateFilterParams - Date not in format YYYY-MM-DD|utilsMethods.handleDateFilterParams()|unit|Exception handling|
|HandleDateFilterParams - Success with date filter|utilsMethods.handleDateFilterParams()|unit|Assertion (Expected result)|
|HandleDateFilterParams - Success with from filter|utilsMethods.handleDateFilterParams()|unit|Assertion (Expected result)|
|HandleDateFilterParams - Success with upTo filter|utilsMethods.handleDateFilterParams()|unit|Assertion (Expected result)|
|HandleAmountFilterParams - Min amount not a number|utilsMethods.handleAmountFilterParams()|unit|Exception handling|
|HandleAmountFilterParams - MaxAmount not a number|utilsMethods.handleAmountFilterParams()|unit|Exception handling|
|HandleAmountFilterParams - Success with minAmount and maxAmount filters|utilsMethods.handleAmountFilterParams()|unit|Assertion (Expected result)|
|HandleAmountFilterParams - Success with only minAmount filter|utilsMethods.handleAmountFilterParams()|unit|Assertion (Expected result)|
|HandleAmountFilterParams - Success with only maxAmount filter|utilsMethods.handleAmountFilterParams()|unit|Assertion (Expected result)|
|VerifyAuth - Success|utilsMethods.verifyAuth()|unit|Assertion (Expected result)|
|VerifyAuth - Tokens missing|utilsMethods.verifyAuth()|unit|Assertion (Expected result)|
|VerifyAuth - Tokens is missing information|utilsMethods.verifyAuth()|unit|Assertion (Expected result)|
|VerifyAuth - Mismatched users|utilsMethods.verifyAuth()|unit|Assertion (Expected result)|
|VerifyAuth - AccessToken expired|utilsMethods.verifyAuth()|unit|Assertion (Expected result)|
|Create Category - Success|controller.createCategory|Integration| WB - Statement Coverage |
|Create Category - Not enough attributes|controller.createCategory|Integration| WB - Branch Coverage |
|Create Category - Type attributes is empty|controller.createCategory|Integration| WB - Branch Coverage |
|Create Category - Category already exist|controller.createCategory|Integration| WB - Branch Coverage |
|Create Category - Not an Admin|controller.createCategory|Integration| WB - Branch Coverage |
|Update Category - Success|controller.updateCategory|Integration| WB - Statement Coverage |
|Update Category - Invalid Parameters|controller.updateCategory|Integration| WB - Branch Coverage |
|Update Category - Empty Parameters|controller.updateCategory|Integration| WB - Branch Coverage |
|Update Category - Category doesn't exist|controller.updateCategory|Integration| WB - Branch Coverage |
|Update Category - New Category already exist|controller.updateCategory|Integration| WB - Branch Coverage |
|Update Category - Not an Admin|controller.updateCategory|Integration| WB - Branch Coverage |
|Delete Category - Delete 1 - Success|controller.deleteCategory|Integration| WB - Statement Coverage |
|Delete Category - Delete Many - Success|controller.deleteCategory|Integration| WB - Branch Coverage |
|Delete Category - Only 1 category in the DB|controller.deleteCategory|Integration| WB - Branch Coverage |
|Delete Category - At least 1 category type is empty in the input array|controller.deleteCategory|Integration| WB - Branch Coverage |
|Delete Category - At least 1 category is not in the DB|controller.deleteCategory|Integration| WB - Branch Coverage |
|Delete Category - Body doesn't contain all attributes|controller.deleteCategory|Integration| WB - Branch Coverage |
|Delete Category - Not Authenticated|controller.deleteCategory|Integration| WB - Branch Coverage |
|Delete Category - Regular User Authenticated, not Admin|controller.deleteCategory|Integration| WB - Branch Coverage |
|Get Categories - Success|controller.getCategories|Integration| WB - Statement Coverage |
|Get Categories - User not Authenticated|controller.getCategories|Integration| WB - Branch Coverage |
|Create Transaction - Success|controller.createTransaction|Integration| WB - Statement Coverage |
|Create Transaction - Missing attributes|controller.createTransaction|Integration| WB - Branch Coverage |
|Create Transaction - Empty body attributes|controller.createTransaction|Integration| WB - Branch Coverage |
|Create Transaction - Category doesn't exist in the DB|controller.createTransaction|Integration| WB - Branch Coverage |
|Create Transaction - Route Username doesn't match the request body|controller.createTransaction|Integration| WB - Branch Coverage |
|Create Transaction - Route Username is not in the DB|controller.createTransaction|Integration| WB - Branch Coverage |
|Create Transaction - Body Username is not in the DB|controller.createTransaction|Integration| WB - Branch Coverage |
|Create Transaction - Amount is not a float|controller.createTransaction|Integration| WB - Branch Coverage |
|Create Transaction - Authenticated user doesn't match the user in body|controller.createTransaction|Integration| WB - Branch Coverage |
|Get All Transaction - Success|controller.getAllTransactions|Integration| WB - Statement Coverage |
|Get All Transaction - No Transaction in the DB|controller.getAllTransactions|Integration| WB - Branch Coverage |
|Get All Transaction - Authenticated Regular User, not an Admin|controller.getAllTransactions|Integration| WB - Branch Coverage |
|Get Transaction By User - Regular User - Success|controller.getTransactionsByUser|Integration| WB - Statement Coverage |
|Get Transaction By User - Admin - Success|controller.getTransactionsByUser|Integration| WB - Branch Coverage |
|Get Transaction By User - Admin - Username in params not in the DB|controller.getTransactionsByUser|Integration| WB - Branch Coverage |
|Get Transaction By User - Regular User - User authenticated and params doesn't match|controller.getTransactionsByUser|Integration| WB - Branch Coverage |
|Get Transaction By User - Regular User - Admin route for an authorized regular user|controller.getTransactionsByUser|Integration| WB - Branch Coverage |
|Get Transactions By User By Category - Regular User - Success|controller.getTransactionsByUserByCategory|Integration| WB - Statement Coverage |
|Get Transactions By User By Category - Admin - Success|controller.getTransactionsByUserByCategory|Integration| WB - Branch Coverage |
|Get Transactions By User By Category - Admin - Username in params not in the DB|controller.getTransactionsByUserByCategory|Integration| WB - Branch Coverage |
|Get Transactions By User By Category - Admin - Category in params not in the DB|controller.getTransactionsByUserByCategory|Integration| WB - Branch Coverage |
|Get Transactions By User By Category - Regular User - User authenticated and params doesn't match|controller.getTransactionsByUserByCategory|Integration| WB - Branch Coverage |
|Get Transactions By User By Category - Regular User - Admin route for an authorized regular user|controller.getTransactionsByUserByCategory|Integration| WB - Branch Coverage |
|Get Transactions By Group - Regular User - Success|controller.getTransactionsByGroup|Integration| WB - Statement Coverage |
|Get Transactions By Group - Admin - Success|controller.getTransactionsByGroup|Integration| WB - Branch Coverage |
|Get Transaction By Group - Admin - Group in params not in the DB|controller.getTransactionsByGroup|Integration| WB - Branch Coverage |
|Get Transaction By Group - Regular User - Authenticated User not part of the group|controller.getTransactionsByGroup|Integration| WB - Branch Coverage |
|Get Transaction By Group - Regular User - Admin Route for an authenticated Regular User|controller.getTransactionsByGroup|Integration| WB - Branch Coverage |
|Get Transactions By Group By Category - Regular User - Success|controller.getTransactionsByGroupByCategory|Integration| WB - Statement Coverage |
|Get Transactions By Group By Category - Admin - Success|controller.getTransactionsByGroupByCategory|Integration| WB - Branch Coverage |
|Get Transactions By Group By Category - Admin - Group in params not in the DB|controller.getTransactionsByGroupByCategory|Integration| WB - Branch Coverage |
|Get Transactions By Group By Category - Admin - Category in params not in the DB|controller.getTransactionsByGroupByCategory|Integration| WB - Branch Coverage |
|Get Transactions By Group By Category - Regular User - Authenticated User not part of the group|controller.getTransactionsByGroupByCategory|Integration| WB - Branch Coverage |
|Get Transactions By Group By Category - Regular User - Admin Route for an authenticated Regular User|controller.getTransactionsByGroupByCategory|Integration| WB - Branch Coverage |
|Delete Transaction - Success|controller.deleteTransaction|Integration| WB - Statement Coverage |
|Delete Transaction - Missing body attributes|controller.deleteTransaction|Integration| WB - Branch Coverage |
|Delete Transaction - Username in params not in the DB|controller.deleteTransaction|Integration| WB - Branch Coverage |
|Delete Transaction - Transaction ID, in the body, not in the DB|controller.deleteTransaction|Integration| WB - Branch Coverage |
|Delete Transaction - The user is not the owner|controller.deleteTransaction|Integration| WB - Branch Coverage |
|Delete Transactions - Delete 1 - Success|controller.deleteTransactions|Integration| WB - Statement Coverage |
|Delete Transactions - Delete many - Success|controller.deleteTransactions|Integration| WB - Branch Coverage |
|Delete Transactions - Missing body attributes|controller.deleteTransactions|Integration| WB - Branch Coverage |
|Delete Transactions - 1 attribute is empty|controller.deleteTransactions|Integration| WB - Branch Coverage |
|Delete Transactions - Transaction ID in the body not in the DB|controller.deleteTransactions|Integration| WB - Branch Coverage |
|Delete Transactions - Not authenticated|controller.deleteTransactions|Integration| WB - Branch Coverage |
|Create Category - New category inserted|controller.createCategory|Unit||
|Create Category - Not enough attributes|controller.createCategory|Unit||
|Create Catetgory - Type attributes is empty|controller.createCategory|Unit||
|Create Catetgory - Category already exist|controller.createCategory|Unit||
|Create Catetgory - Not an Admin|controller.createCategory|Integration||
|Update Category - Success|controller.updateCategory|Unit||
|Update Category - Invalid Parameters|controller.updateCategory|Unit||
|Update Category - Empty Parameters|controller.updateCategory|Unit||
|Update Category - Category doesn't exist|controller.updateCategory|Unit||
|Update Category - New Category already exist|controller.updateCategory|Unit||
|Update Category - Not an Admin|controller.updateCategory|Unit||
|Delete Category - Delete 1|controller.deleteCategory|Unit||
|Delete Category - Delete Many|controller.deleteCategory|Unit||
|Delete Category - Only 1 category in the DB|controller.deleteCategory|Unit||
|Delete Category - 1 type is empty in the input array|controller.deleteCategory|Unit||
|Delete Category - 1 is not a category in the DB|controller.deleteCategory|Unit||
|Delete Category - Body doesn't contain all|controller.deleteCategory|Unit||
|Delete Category - Not Authenticated|controller.deleteCategory|Unit||
|Delete Category - Regular User Authenticated, not Admin|controller.deleteCategory|Unit||
|Get Categories - Success!|controller.getCategories|Unit||
|Get Categories - User not Authenticated|controller.getCategories|Unit||
|Create Transaction - Success!|controller.createTransaction|Unit||
|Create Transaction - Missing attributes|controller.createTransaction|Unit||
|Create Transaction - Empty body attributes|controller.createTransaction|Unit||
|Create Transaction - Empty body attributes|controller.createTransaction|Unit||
|Create Transaction - Route Username doesn't match the request body|controller.createTransaction|Unit||
|Create Transaction - Route Username is not in the DB|controller.createTransaction|Unit||
|Create Transaction - Body Username is not in the DB|controller.createTransaction|Unit||
|Create Transaction - Amount is not a float|controller.createTransaction|Unit||
|Create Transaction !!! - Authenticated user doesn't match the user in body|controller.createTransaction|Unit||
|Get All Transaction - Success|controller.getAllTransactions|Unit||
|Get All Transaction - No Transaction in the DB|controller.getAllTransactions|Unit||
|Get All Transaction - Authenticated Regular User, not an Admin|controller.getAllTransactions|Unit||
|Get Transaction By User - Regular User - Success|controller.getTransactionsByUser|Unit||
|Get Transaction By User - Admin - Success|controller.getTransactionsByUser|Unit||
|Get Transaction By User - Admin - Username in params not in the DB|controller.getTransactionsByUser|Unit||
|Get Transaction By User - Regular User - User authenticated and params doesn't match|controller.getTransactionsByUser|Unit||
|Get Transaction By User - Regular User - Admin route for an authorized regular user|controller.getTransactionsByUser|Unit||
|Get Transactions By User By Category - Regular User - Success|controller.getTransactionsByUserByCategory|Unit||
|Get Transactions By User By Category - Admin - Success|controller.getTransactionsByUserByCategory|Unit||
|Get Transactions By User By Category - Admin - Username in params not in the DB|controller.getTransactionsByUserByCategory|Unit||
|Get Transactions By User By Category - Admin - Category in params not in the DB|controller.getTransactionsByUserByCategory|Unit||
|Get Transactions By User By Category - Regular User - User authenticated and params doesn't match|controller.getTransactionsByUserByCategory|Unit||
|Get Transactions By User By Category - Regular User - Admin route for an authorized regular user|controller.getTransactionsByUserByCategory|Unit||
|Get Transactions By Group - Regular User - Success|controller.getTransactionsByGroup|Unit||
|Get Transactions By Group - Admin - Success|controller.getTransactionsByGroup|Unit||
|Get Transaction By Group - Admin - Group in params not in the DB|controller.getTransactionsByGroup|Unit||
|Get Transaction By Group - Regular User - Authenticated User not part of the group|controller.getTransactionsByGroup|Unit||
|Get Transaction By Group - Regular User - Admin Route for an authenticated Regular User|controller.getTransactionsByGroup|Unit||
|Get Transactions By Group By Category - Regular User - Success |controller.getTransactionsByGroupByCategory|Unit||
|Get Transactions By Group By Category - Admin - Success|controller.getTransactionsByGroupByCategory|Unit||
|Get Transactions By Group By Category - Admin - Group in params not in the DB|controller.getTransactionsByGroupByCategory|Unit||
|Get Transactions By Group By Category - Admin - Category in params not in the DB|controller.getTransactionsByGroupByCategory|Unit||
|Get Transactions By Group By Category - Regular User - Authenticated User not part of the group|controller.getTransactionsByGroupByCategory|Unit||
|Get Transactions By Group By Category - Regular User - Admin Route for an authenticated Regular User|controller.getTransactionsByGroupByCategory|Unit||
|Delete Transaction - Success|controller.deleteTransaction|Unit||
|Delete Transaction - Missing body attributes|controller.deleteTransaction|Unit||
|Delete Transaction - Username in params not in the DB|controller.deleteTransaction|Unit||
|Delete Transaction - Transaction ID, in the body, not in the DB|controller.deleteTransaction|Unit||
|Delete Transaction - The user is not the owner|controller.deleteTransaction|Unit||
|Delete Transactions - Delete 1 - Success|controller.deleteTransactions|Unit||
|Delete Transactions - Delete many - Success|controller.deleteTransactions|Unit||
|Delete Transactions - Missing body attributes|controller.deleteTransactions|Unit||
|Delete Transactions - 1 attribute is empty|controller.deleteTransactions|Unit||
|Delete Transactions - Transaction ID in the body not in the DB|controller.deleteTransactions|Unit||
|Delete Transactions - Not authenticated|controller.deleteTransactions|Unit||





# Coverage

## Coverage of FR

| Functional Requirements covered | Test(s) |
| ------------------------------- | ----------- |
| FR1 | |  
| FR11 |  "register" : "Registration - Done" / "Registration - Invalid Email" / "Registration - Already Registered" |
| FR12 | "LogIn" : "Login - Done" / "Login - Missing or Empty Field" / "Login - Not registered" / "Login - Wrong Credentials" |
| FR13 | "LogOut" : "Logout - Done" / "Logout - Already logged out" / "Logout - User not found - find" |
|FR14 |"Admin" = registerAdmin : "Register Admin - Done" / "Register Admin - Missing Information" / "Register Admin - Already Registered"|
|FR15 |"getUsers" : "GetUsers - Success with filled list" / "GetUsers - Success with empty list" / "GetUsers - Unauthorized" |
|FR16 | "getUser" : <br> 1 - "Admin" : "GetUser - Success" / "GetUser - User not found" <br> 2 - "Regular" : "GetUser - Success" / "GetUser - User not found" / "GetUser - Unauthorized"|
|FR17 | "deleteUser" : "DeleteUser - Success" / "DeleteUser - Unauthorized" / "DeleteUser - No email provided" / "DeleteUser - Invalid email format" /"DeleteUser - User not found" / "DeleteUser - Admin not removable"|
| FR2 | |  
| FR21 | "createGroup" = " createGroup-success" / "CreateGroup - Unauthorized" /"CreateGroup - Missing parameters"/ "CreateGroup - Group already exists" / "CreateGroup - User already in a group" | 
|FR22 |"getGroups" : "GetGroups - Success" / "GetGroups - Unauthorized" |
|FR23 |"getGroup" : "GetGroup - Group doesn't exist" <br> 1 - "Admin" : "GetGroup - Admin - Success" / "GetGroup - Admin - Unauthorized" <br> 2 - "User" : "GetGroup - User - Success" / "GetGroup - User - Unauthorized" / "GetGroup - User - User not found" / "GetGroup - User - User not in group"  | 
| FR24 | "addToGroup" = "AddToGroup - Success"/ "AddToGroup - Group not found" / "AddToGroup - No emails provided" / "AddToGroup - User doesn't exist or already in group" | 
| FR26 |"RemoveFromGroup" = "RemoveFromGroup - Success" / "RemoveFromGroup - Group does not exist" / "RemoveFromGroup - No emails provided" / "RemoveFromGroup - Cannot remove all members of a group" / "RemoveFromGroup - Invalid emails"  |     
| FR28 | "deleteGroup" : "DeleteGroup - Success" / "DeleteGroup - Unauthorized" / "DeleteGroup - Missing group name" / "DeleteGroup - Group doesn't exist" |
| FR3 | |  
| FR31 |"createTransaction" : "CreateTransaction - Success" / "CreateTransaction - Unauthorized" / "CreateTransaction - Missing or empty parameters" / "CreateTransaction - Amount is not a number" / "CreateTransaction - Username not equivalent" / "CreateTransaction - Username (or Category) doesn't exists" |  
| FR32 | "getAllTransactions" : "GetAllTransactions - Success" / "GetAllTransactions - Empty list" / "GetAllTransactions - Unauthorized" |  
| FR33 | "getTransactionsByUser" : <br> 1 - "Admin User" : "GetTransactionByUser - Admin - Success" / "GetTransactionByUser - Admin - Unauthorized" / "GetTransactionByUser - Admin - User not found" / "GetTransactionByUser - Admin - No transactions" . <br> 2 - "Regular User" : "GetTransactionByUser - User - Success - Date Filter with filled list" / "GetTransactionByUser - User - Success - Date Filter with empty list" / "GetTransactionByUser - User - Success - From filter with filled list" / "GetTransactionByUser - User - Success - From Filter with empty list" / "GetTransactionByUser - User - Success - UpTo filter with filled list" / "GetTransactionByUser - User - Success - UpTo Filter with empty list" / "GetTransactionByUser - User - Success - MinAmount Filter with empty list" / "GetTransactionByUser - User - Success - MinAmount Filter with filled list" / "GetTransactionByUser - User - Success - MaxAmount Filter with empty list" / "GetTransactionByUser - User - Success - MaxAmount Filter with filled list" / "GetTransactionByUser - User - Throws error cause From and UpTo cannot be together" / "GetTransactionByUser - User - Unauthorized" / "GetTransactionByUser - User - User not found"|  
| FR34 |"getTransactionsByUserByCategory" : <br> 1 - "Admin" : "GetTransactionByUserByCategory - Admin - Success - Filled list" / "GetTransactionByUserByCategory - Admin - Success - Empty list" / "GetTransactionByUserByCategory - Admin - Unauthorized" / "GetTransactionByUserByCategory - Admin - User not found" / "GetTransactionByUserByCategory - Admin - Category not found". <br> 2 - "User" : "GetTransactionByUserByCategory - User - Success - Filled list" / "GetTransactionByUserByCategory - User - Success - Empty list" / "GetTransactionByUserByCategory - User - Unauthorized" / "GetTransactionByUserByCategory - User - User not found" / "GetTransactionByUserByCategory - User - Category not found" |  
| FR35 | "getTransactionsByGroup" : <br> 1 - "Admin" : "GetTransactionByGroup - Admin - Success - Filled list" / "GetTransactionByGroup - Admin - Success - Empty list" / "GetTransactionByGroup - Admin - Unauthorized" / "GetTransactionByGroup - Admin - Group not found" <br> 2 - "Group" : "GetTransactionByGroup - Group - Success - Filled list" / "GetTransactionByGroup - Group - Success - Empty list" / "GetTransactionByGroup - Group - Unauthorized" / "GetTransactionByGroup - Group - Group not found"  |
| FR36 |"getTransactionsByGroupByCategory" : <br> 1 - "Admin" : "GetTransactionByGroupByCategory - Admin - Success - Filled list" / "GetTransactionByGroupByCategory - Admin - Success - Empty list" / "GetTransactionByGroupByCategory - Admin - Unauthorized" "GetTransactionByGroupByCategory - Admin - Group not found" / "GetTransactionByGroupByCategory - Admin - Category not found"  . <br> 2 - "Group" : "GetTransactionByGroupByCategory - Group - Success - Filled list" / "GetTransactionByGroupByCategory - Group - Success - Empty list" / "GetTransactionByGroupByCategory - Group - Unauthorized" / "GetTransactionByGroupByCategory - Group - Group not found" / "GetTransactionByGroupByCategory - Group - Category not found"  |  
| FR37 |"deleteTransaction" : <br> 1 - "Admin" : "DeleteTransaction - Admin - Success" / "DeleteTransaction - Admin - Missing Ids" / "DeleteTransaction - Admin - Transaction not found" /  <br> 2 - "User" : "DeleteTransaction - User - Success" / "DeleteTransaction - User - User not found" / "DeleteTransaction - User - Missing Ids" / "DeleteTransaction - User - Transaction not found" / "DeleteTransaction - User - User not the owner" . |  
| FR38 | "deleteTransactions" : "DeleteTransactions - Admin - Success" / "DeleteTransactions - Admin - Missing _ids" / "DeleteTransactions - Admin - Empty _ids" / "DeleteTransactions - Admin - Transactions don't exist" / "DeleteTransactions - Admin - Transaction not found" |   
| FR4 | |  
| FR41 |"createCategory" : "CreateCategory - Success" / "CreateCategory - Unauthorized" / "CreateCategory - Missing or Empty fields" / "CreateCategory - Already exists"  |  
| FR42 |"updateCategory" : "UpdateCategory - Unauthorized" / "UpdateCategory - Missing or Empty fields" / "UpdateCategory - Old Category not exists" / "UpdateCategory - Category already exists" / "Update Category - Success"  |  
| FR43 | "deleteCategory" : "Delete category - Success - Only One Category" / "Delete category - Success - All Category, One left" / "Delete category - Unauthorized" / "Delete category - Missing or Empty parameters" / "Delete category - Empty string in type array" / "Delete category - No categories can be deleted" / "Delete category - Category not found"  |  
| FR44 |"getCategories" : "GetCategories - Success" / "GetCategories - Empty List" / "GetCategories - Unauthorized"  |  



## Coverage white box

![ReportImages](assets/Images/CoverageScreen.png)

Note:
The "Uncovered Lines" are the sections corresponding to "Errors 500" within the try-catch blocks.
