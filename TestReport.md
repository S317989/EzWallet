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
|getGroups - Success|usersMethods.getGroups|Unit|wb - Statement|
|getGroups - Unauthorized|usersMethods.getGroups|Unit|wb - Branches|
|getGroup - Group doesn't exist|usersMethods.getGroups|Unit|wb - Branches|
|getGroup - Admin - Success|usersMethods.getGroups|Unit|wb - Statement|
|getGroup - Admin - Unauthorized|usersMethods.getGroups|Unit|wb - Branches|
|DeleteUser - Unauthorized|usersMethods.deleteUser|Unit|wb - Branches|
|DeleteUser - No email provided|usersMethods.deleteUse|Unit|wb - Branches|
|DeleteUser - Invalid email format|usersMethods.deleteUser|Unit|wb - Branches|
|DeleteUser - User not found|usersMethods.deleteUser|Unit|wb - Branches|
|DeleteUser - Admin not removable|usersMethods.deleteUser|Unit|wb - Branches|
|DeleteGroup - Success|usersMethods.deleteUser|Unit|wb - Statement|
|DeleteGroup - Unauthorized|usersMethods.deleteUser|Unit|wb - Statement|
|DeleteGroup - Missing group name|usersMethods.deleteUser|Unit|wb - Statement|
|DeleteGroup - Group doesn't exist|usersMethods.deleteUser|Unit|wb - Statement|
|HandleDateFilterParams - upTo and from cannot be together|utilsMethods.handleDateFilterParams()|Unit|Exception handling|
|HandleDateFilterParams - Date not in format YYYY-MM-DD|utilsMethods.handleDateFilterParams()|Unit|Exception handling|
|HandleDateFilterParams - Success with date filter|utilsMethods.handleDateFilterParams()|Unit|Assertion (Expected result)|
|HandleDateFilterParams - Success with from filter|utilsMethods.handleDateFilterParams()|Unit|Assertion (Expected result)|
|HandleDateFilterParams - Success with upTo filter|utilsMethods.handleDateFilterParams()|Unit|Assertion (Expected result)|
|HandleAmountFilterParams - Min amount not a number|utilsMethods.handleAmountFilterParams()|Unit|Exception handling|
|HandleAmountFilterParams - MaxAmount not a number|utilsMethods.handleAmountFilterParams()|Unit|Exception handling|
|HandleAmountFilterParams - Success with minAmount and maxAmount filters|utilsMethods.handleAmountFilterParams()|Unit|Assertion (Expected result)|
|HandleAmountFilterParams - Success with only minAmount filter|utilsMethods.handleAmountFilterParams()|Unit|Assertion (Expected result)|
|HandleAmountFilterParams - Success with only maxAmount filter|utilsMethods.handleAmountFilterParams()|Unit|Assertion (Expected result)|
|VerifyAuth - Success|utilsMethods.verifyAuth()|Unit|Assertion (Expected result)|
|VerifyAuth - Tokens missing|utilsMethods.verifyAuth()|Unit|Assertion (Expected result)|
|VerifyAuth - Tokens is missing information|utilsMethods.verifyAuth()|Unit|Assertion (Expected result)|
|VerifyAuth - Mismatched users|utilsMethods.verifyAuth()|Unit|Assertion (Expected result)|
|VerifyAuth - AccessToken expired|utilsMethods.verifyAuth()|Unit|Assertion (Expected result)|
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
|CreateCategory - Success|controller.createCategory|Unit| WB - Statement Coverage |
|CreateCategory - Unauthorized|controller.createCategory|Unit| WB - Branch Coverage |
|CreateCategory - Missing or Empty fields|controller.createCategory|Unit| WB - Branch Coverage |
|CreateCategory - Already exists|controller.createCategory|Unit| WB - Branch Coverage |
|UpdateCategory - Success|controller.updateCategory|Unit| WB - Statement Coverage |
|UpdateCategory - Missing or Empty fields|controller.updateCategory|Unit| WB - Branch Coverage |
|UpdateCategory - Unauthorized|controller.updateCategory|Unit| WB - Branch Coverage |
|UpdateCategory - Old Category not exists|controller.updateCategory|Unit| WB - Branch Coverage |
|Update Category - New Category already exist|controller.updateCategory|Unit| WB - Branch Coverage |
|Delete category - Success - Only One Category|controller.deleteCategory|Unit| WB - Statement Coverage |
|Delete category - Success - All Category, One left|controller.deleteCategory|Unit| WB - Statement Coverage |
|Delete Category - Only 1 category in the DB|controller.deleteCategory|Unit| WB - Branch Coverage |
|Delete category - Unauthorized|controller.deleteCategory|Unit| WB - Branch Coverage |
|Delete category - Missing or Empty parameters|controller.deleteCategory|Unit| WB - Branch Coverage |
|Delete category - No categories can be deleted|controller.deleteCategory|Unit| WB - Branch Coverage |
|Delete category - Category not found|controller.deleteCategory|Unit| WB - Branch Coverage |
|GetCategories - Success|controller.getCategories|Unit| WB - Statement Coverage |
|GetCategories - Empty List|controller.getCategories|Unit| WB - Branch Coverage |
|GetCategories - Unauthorized|controller.getCategories|Unit| WB - Branch Coverage |
|CreateTransaction - Success|controller.createTransaction|Unit| WB - Statement Coverage |
|CreateTransaction - Unauthorized|controller.createTransaction|Unit| WB - Branch Coverage |
|Create Transaction - Empty body attributes|controller.createTransaction|Unit| WB - Branch Coverage |
|CreateTransaction - Missing or empty parameters|controller.createTransaction|Unit| WB - Branch Coverage |
|CreateTransaction - Amount is not a number|controller.createTransaction|Unit| WB - Branch Coverage |
|CreateTransaction - Username not equivalent|controller.createTransaction|Unit| WB - Branch Coverage |
CreateTransaction - Username (or Category) doesn't exists|controller.createTransaction|Unit| WB - Branch Coverage |
|GetAllTransactions - Success|controller.getAllTransactions|Unit| WB - Statement Coverage |
|GetAllTransactions - Empty list|controller.getAllTransactions|Unit| WB - Statement Coverage |
|GetAllTransactions - Unauthorized|controller.getAllTransactions|Unit| WB - Branch Coverage |
|GetTransactionByUser - Admin - Success|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - Admin - Unauthorized|controller.getTransactionsByUser|Unit| WB - Branch Coverage |
|GetTransactionByUser - Admin - User not found|controller.getTransactionsByUser|Unit| WB - Branch Coverage |
|GetTransactionByUser - Admin - No transactions|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - Date Filter with filled list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - Date Filter with empty list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - From filter with filled list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - From Filter with empty list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - UpTo filter with filled list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - UpTo Filter with empty list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - MinAmount filter with filled list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - MinAmount Filter with empty list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - MaxAmount filter with filled list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Success - MaxAmount Filter with empty list|controller.getTransactionsByUser|Unit| WB - Statement Coverage |
|GetTransactionByUser - User - Throws error cause From and UpTo cannot be together|controller.getTransactionsByUser|Unit| WB - Branch Coverage |
|GetTransactionByUser - User - Unauthorized|controller.getTransactionsByUser|Unit| WB - Branch Coverage |
|GetTransactionByUser - User - User not found|controller.getTransactionsByUser|Unit| WB - Branch Coverage |
|GetTransactionByUserByCategory - Admin - Success - Filled list|controller.getTransactionsByUserByCategory|Unit| WB - Statement Coverage |
|GetTransactionByUserByCategory - Admin - Success - Empty list|controller.getTransactionsByUserByCategory|Unit| WB - Statement Coverage |
|GetTransactionByUserByCategory - Admin - Unauthorized|controller.getTransactionsByUserByCategory|Unit| WB - Branch Coverage |
|GetTransactionByUserByCategory - Admin - User not found|controller.getTransactionsByUserByCategory|Unit| WB - Branch Coverage |
|GetTransactionByUserByCategory - Admin - Category not found|controller.getTransactionsByUserByCategory|Unit| WB - Branch Coverage |
|GetTransactionByUserByCategory - User - Success - Filled list|controller.getTransactionsByUserByCategory|Unit| WB - Statement Coverage |
|GetTransactionByUserByCategory - User - Success - Empty list|controller.getTransactionsByUserByCategory|Unit| WB - Statement Coverage |
|GetTransactionByUserByCategory - User - Unauthorized|controller.getTransactionsByUserByCategory|Unit| WB - Branch Coverage |
|GetTransactionByUserByCategory - User - User not found|controller.getTransactionsByUserByCategory|Unit| WB - Branch Coverage |
|GetTransactionByUserByCategory - User - Category not found|controller.getTransactionsByUserByCategory|Unit| WB - Branch Coverage |
|GetTransactionByGroup - Admin - Success - Filled list|controller.getTransactionsByGroup|Unit| WB - Statement Coverage |
|GetTransactionByGroup - Admin - Success - Empty list|controller.getTransactionsByGroup|Unit| WB - Statement Coverage |
|GetTransactionByGroup - Admin - Unauthorized|controller.getTransactionsByGroup|Unit| WB - Branch Coverage |
|GetTransactionByGroup - Admin - Group not found|controller.getTransactionsByGroup|Unit| WB - Branch Coverage |
|GetTransactionByGroup - Group - Success - Filled list|controller.getTransactionsByGroup|Unit| WB - Statement Coverage |
|GetTransactionByGroup - Group - Success - Empty list|controller.getTransactionsByGroup|Unit| WB - Statement Coverage |
|GetTransactionByGroup - Group - Unauthorized|controller.getTransactionsByGroup|Unit| WB - Branch Coverage |
|GetTransactionByGroup - Group - Group not found|controller.getTransactionsByGroup|Unit| WB - Branch Coverage |
|GetTransactionByGroupByCategory - Admin - Success - Filled list|controller.getTransactionsByGroupByCategory|Unit| WB - Statement Coverage |
|GetTransactionByGroupByCategory - Admin - Success - Empty list|controller.getTransactionsByGroupByCategory|Unit| WB - Statement Coverage |
|GetTransactionByGroupByCategory - Admin - Unauthorized|controller.getTransactionsByGroupByCategory|Unit| WB - Branch Coverage |
|GetTransactionByGroupByCategory - Admin - Group not found|controller.getTransactionsByGroupByCategory|Unit| WB - Branch Coverage |
|GetTransactionByGroupByCategory - Admin - Category not found|controller.getTransactionsByGroupByCategory|Unit| WB - Branch Coverage |
|GetTransactionByGroupByCategory - Group - Success - Filled list|controller.getTransactionsByGroupByCategory|Unit| WB - Statement Coverage |
|GetTransactionByGroupByCategory - Group - Success - Empty list|controller.getTransactionsByGroupByCategory|Unit| WB - Statement Coverage |
|GetTransactionByGroupByCategory - Group - Unauthorized|controller.getTransactionsByGroupByCategory|Unit| WB - Branch Coverage |
|GetTransactionByGroupByCategory - Group - Group not found|controller.getTransactionsByGroupByCategory|Unit| WB - Branch Coverage |
|GetTransactionByGroupByCategory - Group - Category not found|controller.getTransactionsByGroupByCategory|Unit| WB - Branch Coverage |
|DeleteTransaction - Admin - Success|controller.deleteTransaction|Unit| WB - Statement Coverage |
|DeleteTransaction - Admin - Missing Ids|controller.deleteTransaction|Unit| WB - Branch Coverage |
|DeleteTransaction - Admin - Transaction not found|controller.deleteTransaction|Unit| WB - Branch Coverage |
|DeleteTransaction - User - Success|controller.deleteTransaction|Unit| WB - Statement Coverage |
|DeleteTransaction - User - User not found|controller.deleteTransaction|Unit| WB - Branch Coverage |
|DeleteTransaction - User - Missing Ids|controller.deleteTransaction|Unit| WB - Branch Coverage |
|DeleteTransaction - User - Transaction not found|controller.deleteTransaction|Unit| WB - Branch Coverage |
|DeleteTransaction - User - User not the owner|controller.deleteTransaction|Unit| WB - Branch Coverage |
|DeleteTransactions - Admin - Success|controller.deleteTransactions|Unit| WB - Statement Coverage |
|DeleteTransactions - Admin - Missing _ids|controller.deleteTransactions|Unit| WB - Branch Coverage |
|DeleteTransactions - Admin - Empty _ids|controller.deleteTransactions|Unit| WB - Branch Coverage |
|DeleteTransactions - Admin - Transactions don't exist|controller.deleteTransactions|Unit| WB - Branch Coverage |
|DeleteTransactions - Admin - Transaction not found|controller.deleteTransactions|Unit| WB - Branch Coverage |


# Coverage

## Coverage of FR

| Functional Requirements covered | Test(s) |
| ------------------------------- | ----------- |
| FR1 | |  
| &emsp; FR1.1 |  **"Register"** <br> "Registration - Done" / "Registration - Invalid Email" / "Registration - Already Registered" |
| &emsp; FR1.2 | **"LogIn"** <br> "Login - Done" / "Login - Missing or Empty Field" / "Login - Not registered" / "Login - Wrong Credentials" |
| &emsp; FR1.3 | **"LogOut"** <br> "Logout - Done" / "Logout - Already logged out" / "Logout - User not found - find" |
| &emsp; FR1.4 | **RegisterAdmin** <br> "Register Admin - Done" / "Register Admin - Missing Information" / "Register Admin - Already Registered"|
| &emsp; FR1.5 | **"getUsers"** <br> "GetUsers - Success with filled list" / "GetUsers - Success with empty list" / "GetUsers - Unauthorized" |
| &emsp; FR1.6 | **"getUser"** <br> 1 - "Admin" : "GetUser - Success" / "GetUser - User not found" <br> 2 - "Regular" : "GetUser - Success" / "GetUser - User not found" / "GetUser - Unauthorized"|
| &emsp; FR1.7 | **"deleteUser"** <br> "DeleteUser - Success" / "DeleteUser - Unauthorized" / "DeleteUser - No email provided" / "DeleteUser - Invalid email format" /"DeleteUser - User not found" / "DeleteUser - Admin not removable"|
| FR2 | |  
| &emsp; FR2.1 | **"createGroup"** <br> "CreateGroup - success" / "CreateGroup - Unauthorized" /"CreateGroup - Missing parameters"/ "CreateGroup - Group already exists" / "CreateGroup - User already in a group" | 
| &emsp; FR2.2 | **"getGroups"** <br> "GetGroups - Success" / "GetGroups - Unauthorized" |
| &emsp; FR2.3 | **"getGroup"** <br> "GetGroup - Group doesn't exist" <br> 1 - "Admin" : "GetGroup - Admin - Success" / "GetGroup - Admin - Unauthorized" <br> 2 - "User" : "GetGroup - User - Success" / "GetGroup - User - Unauthorized" / "GetGroup - User - User not found" / "GetGroup - User - User not in group"  | 
| &emsp; FR2.4 | **"addToGroup"** <br> "AddToGroup - Success"/ "AddToGroup - Group not found" / "AddToGroup - No emails provided" / "AddToGroup - User doesn't exist or already in group" | 
| &emsp; FR2.6 | **"RemoveFromGroup"** <br> "RemoveFromGroup - Success" / "RemoveFromGroup - Group does not exist" / "RemoveFromGroup - No emails provided" / "RemoveFromGroup - Cannot remove all members of a group" / "RemoveFromGroup - Invalid emails"  |     
| &emsp; FR2.8 | **"deleteGroup"** <br> "DeleteGroup - Success" / "DeleteGroup - Unauthorized" / "DeleteGroup - Missing group name" / "DeleteGroup - Group doesn't exist" |
| FR3 | |  
| &emsp; FR3.1 | **"createTransaction"** <br>  "CreateTransaction - Success" / "CreateTransaction - Unauthorized" / "CreateTransaction - Missing or empty parameters" / "CreateTransaction - Amount is not a number" / "CreateTransaction - Username not equivalent" / "CreateTransaction - Username (or Category) doesn't exists" |  
| &emsp; FR3.2 | **"getAllTransactions"** <br> "GetAllTransactions - Success" / "GetAllTransactions - Empty list" / "GetAllTransactions - Unauthorized" |  
| &emsp; FR3.3 | **"getTransactionsByUser"** <br> 1 - "Admin User" : "GetTransactionByUser - Admin - Success" / "GetTransactionByUser - Admin - Unauthorized" / "GetTransactionByUser - Admin - User not found" / "GetTransactionByUser - Admin - No transactions" . <br> 2 - "Regular User" : "GetTransactionByUser - User - Success - Date Filter with filled list" / "GetTransactionByUser - User - Success - Date Filter with empty list" / "GetTransactionByUser - User - Success - From filter with filled list" / "GetTransactionByUser - User - Success - From Filter with empty list" / "GetTransactionByUser - User - Success - UpTo filter with filled list" / "GetTransactionByUser - User - Success - UpTo Filter with empty list" / "GetTransactionByUser - User - Success - MinAmount Filter with empty list" / "GetTransactionByUser - User - Success - MinAmount Filter with filled list" / "GetTransactionByUser - User - Success - MaxAmount Filter with empty list" / "GetTransactionByUser - User - Success - MaxAmount Filter with filled list" / "GetTransactionByUser - User - Throws error cause From and UpTo cannot be together" / "GetTransactionByUser - User - Unauthorized" / "GetTransactionByUser - User - User not found"|  
| &emsp; FR3.4 | **"getTransactionsByUserByCategory"** <br> 1 - "Admin" : "GetTransactionByUserByCategory - Admin - Success - Filled list" / "GetTransactionByUserByCategory - Admin - Success - Empty list" / "GetTransactionByUserByCategory - Admin - Unauthorized" / "GetTransactionByUserByCategory - Admin - User not found" / "GetTransactionByUserByCategory - Admin - Category not found". <br> 2 - "User" : "GetTransactionByUserByCategory - User - Success - Filled list" / "GetTransactionByUserByCategory - User - Success - Empty list" / "GetTransactionByUserByCategory - User - Unauthorized" / "GetTransactionByUserByCategory - User - User not found" / "GetTransactionByUserByCategory - User - Category not found" |  
| &emsp; FR3.5 | **"getTransactionsByGroup"** <br> 1 - "Admin" : "GetTransactionByGroup - Admin - Success - Filled list" / "GetTransactionByGroup - Admin - Success - Empty list" / "GetTransactionByGroup - Admin - Unauthorized" / "GetTransactionByGroup - Admin - Group not found" <br> 2 - "Group" : "GetTransactionByGroup - Group - Success - Filled list" / "GetTransactionByGroup - Group - Success - Empty list" / "GetTransactionByGroup - Group - Unauthorized" / "GetTransactionByGroup - Group - Group not found"  |
| &emsp; FR3.6 | **"getTransactionsByGroupByCategory"** <br> 1 - "Admin" : "GetTransactionByGroupByCategory - Admin - Success - Filled list" / "GetTransactionByGroupByCategory - Admin - Success - Empty list" / "GetTransactionByGroupByCategory - Admin - Unauthorized" "GetTransactionByGroupByCategory - Admin - Group not found" / "GetTransactionByGroupByCategory - Admin - Category not found"  . <br> 2 - "Group" : "GetTransactionByGroupByCategory - Group - Success - Filled list" / "GetTransactionByGroupByCategory - Group - Success - Empty list" / "GetTransactionByGroupByCategory - Group - Unauthorized" / "GetTransactionByGroupByCategory - Group - Group not found" / "GetTransactionByGroupByCategory - Group - Category not found"  |  
| &emsp; FR3.7 | **"deleteTransaction"** <br> 1 - "Admin" : "DeleteTransaction - Admin - Success" / "DeleteTransaction - Admin - Missing Ids" / "DeleteTransaction - Admin - Transaction not found" /  <br> 2 - "User" : "DeleteTransaction - User - Success" / "DeleteTransaction - User - User not found" / "DeleteTransaction - User - Missing Ids" / "DeleteTransaction - User - Transaction not found" / "DeleteTransaction - User - User not the owner" . |  
| &emsp; FR3.8 | **"deleteTransactions"** <br> "DeleteTransactions - Admin - Success" / "DeleteTransactions - Admin - Missing _ids" / "DeleteTransactions - Admin - Empty _ids" / "DeleteTransactions - Admin - Transactions don't exist" / "DeleteTransactions - Admin - Transaction not found" |   
| FR4 | |  
| &emsp; FR4.1 | **"createCategory"** <br> "CreateCategory - Success" / "CreateCategory - Unauthorized" / "CreateCategory - Missing or Empty fields" / "CreateCategory - Already exists"  |  
| &emsp; FR4.2 | **"updateCategory"**: "UpdateCategory - Unauthorized" / "UpdateCategory - Missing or Empty fields" / "UpdateCategory - Old Category not exists" / "UpdateCategory - Category already exists" / "Update Category - Success"  |  
| &emsp; FR4.3 | **"deleteCategory"** <br> "Delete category - Success - Only One Category" / "Delete category - Success - All Category, One left" / "Delete category - Unauthorized" / "Delete category - Missing or Empty parameters" / "Delete category - Empty string in type array" / "Delete category - No categories can be deleted" / "Delete category - Category not found"  |  
| &emsp; FR4.4 | **"getCategories"** <br> "GetCategories - Success" / "GetCategories - Empty List" / "GetCategories - Unauthorized"  |  



## Coverage white box

![ReportImages](assets/Images/CoverageScreen.png)

Note:
The "Uncovered Lines" are the sections corresponding to "Errors 500" within the try-catch blocks.
