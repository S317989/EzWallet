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

![ReportImages](assets/Images/dependency%20graph2.jpg)

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
|                |                  |            |                |

# Coverage

## Coverage of FR

| Functional Requirements covered | Test(s) |
| ------------------------------- | ----------- |
| FR1 | |  
| FR1.1 | User = register: "Registration - Done" / "Registration - Invalid Email" / "Registration - Already Registered" , Admin = registerAdmin : "Register Admin - Done" / "Register Admin - Missing Information" / "Register Admin - Already Registered" |
| FR1.2 | LogIn : "Login - Done" / "Login - Missing or Empty Field" / "Login - Not registered" / "Login - Wrong Credentials" |
| FR1.3 | LogOut : "Logout - Done" / "Logout - Already logged out" / "Logout - User not found - find" |
| FR2 | |  
| FR2.1 | createGroup = " createGroup-success" / "CreateGroup - Unauthorized" /"CreateGroup - Missing parameters"/ "CreateGroup - Group already exists" / "CreateGroup - User already in a group" |  
| FR2.2 | addToGroup = "AddToGroup - Success"/ "AddToGroup - Group not found" / "AddToGroup - No emails provided" / "AddToGroup - User doesn't exist or already in group" |  
| FR2.3 | RemoveFromGroup = "RemoveFromGroup - Success" / "RemoveFromGroup - Group does not exist" / "RemoveFromGroup - No emails provided" / "RemoveFromGroup - Cannot remove all members of a group" / "RemoveFromGroup - Invalid emails" |  
| FR3 | |  
| FR3.1 | |  
| FR3.2 | 1- getTransactionsByGroupByCategory 2-Admin : "GetTransactionByGroupByCategory - Admin - Success - Filled list" / "GetTransactionByGroupByCategory - Admin - Success - Empty list" / "GetTransactionByGroupByCategory - Admin - Unauthorized" / "GetTransactionByGroupByCategory - Admin - Group not found" / "GetTransactionByGroupByCategory - Admin - Category not found".                                                        3 - Group : "GetTransactionByGroupByCategory - Group - Success - Filled list" / "GetTransactionByGroupByCategory - Group - Success - Empty list" / "GetTransactionByGroupByCategory - Group - Unauthorized" / "GetTransactionByGroupByCategory - Group - Group not found" / "GetTransactionByGroupByCategory - Group - Category not found" .  
4-User :"GetTransactionByUserByCategory - User - Success - Filled list" / "GetTransactionByUserByCategory - User - Success - Empty list" / "GetTransactionByUserByCategory - User - Unauthorized" / "GetTransactionByUserByCategory - User - User not found" / "GetTransactionByUserByCategory - User - Category not found" |  
| FR3.3 | createTransaction : "CreateTransaction - Success" / "CreateTransaction - Unauthorized" / "CreateTransaction - Missing or empty parameters" / "CreateTransaction - Amount is not a number" / "CreateTransaction - Username not equivalent" / "CreateTransaction - Username (or Category) doesn't exists" |  
| FR3.4 | 1-getTransactionsByUser:
2 - Admin User : "GetTransactionByUser - Admin - Success" / "GetTransactionByUser - Admin - Unauthorized" / "GetTransactionByUser - Admin - User not found" /
"GetTransactionByUser - Admin - No transactions" .
3- Regular User :"GetTransactionByUser - User - Success - Date Filter with filled list" / "GetTransactionByUser - User - Success - Date Filter with empty list" / "GetTransactionByUser - User - Success - From filter with filled list" / "GetTransactionByUser - User - Success - From Filter with empty list" / "GetTransactionByUser - User - Success - UpTo filter with filled list" /"GetTransactionByUser - User - Success - UpTo Filter with empty list" / "GetTransactionByUser - User - Success - MinAmount Filter with empty list" / "GetTransactionByUser - User - Success - MinAmount Filter with filled list" / "GetTransactionByUser - User - Success - MaxAmount Filter with empty list" / "GetTransactionByUser - User - Success - MaxAmount Filter with filled list" / "GetTransactionByUser - User - Throws error cause From and UpTo cannot be together" / "GetTransactionByUser - User - Unauthorized" / "GetTransactionByUser - User - User not found" .
4- getTransactionsByUserByCategory
5-Admin:"GetTransactionByUserByCategory - Admin - Success - Filled list" / "GetTransactionByUserByCategory - Admin - Success - Empty list" / "GetTransactionByUserByCategory - Admin - Unauthorized" / "GetTransactionByUserByCategory - Admin - User not found" / "GetTransactionByUserByCategory - Admin - Category not found" .
6- User :"GetTransactionByUserByCategory - User - Success - Filled list" / "GetTransactionByUserByCategory - User - Success - Empty list" / "GetTransactionByUserByCategory - User - Unauthorized" / "GetTransactionByUserByCategory - User - User not found" / "GetTransactionByUserByCategory - User - Category not found" .
7- getTransactionsByGroup
8-Admin : "GetTransactionByGroup - Admin - Success - Filled list" / "GetTransactionByGroup - Admin - Success - Empty list" / "GetTransactionByGroup - Admin - Unauthorized" / "GetTransactionByGroup - Admin - Group not found" .
9- Group : "GetTransactionByGroup - Group - Success - Filled list" / "GetTransactionByGroup - Group - Success - Empty list" / "GetTransactionByGroup - Group - Unauthorized" / "GetTransactionByGroup - Group - Group not found" .
10- getTransactionsByGroupByCategory
11-Admin : "GetTransactionByGroupByCategory - Admin - Success - Filled list" / "GetTransactionByGroupByCategory - Admin - Success - Empty list" / "GetTransactionByGroupByCategory - Admin - Unauthorized" / "GetTransactionByGroupByCategory - Admin - Group not found" / "GetTransactionByGroupByCategory - Admin - Category not found".
12 - Group : " GetTransactionByGroupByCategory - Group - Success - Filled list" / "GetTransactionByGroupByCategory - Group - Success - Empty list" / "GetTransactionByGroupByCategory - Group - Unauthorized" / " GetTransactionByGroupByCategory - Group - Group not found" / "GetTransactionByGroupByCategory - Group - Category not found" . |  
| FR3.5 | |  
| FR4 | |  
| FR4.1 | |  
| FR4.2 | |  
| FR4.3 | |  
| FR4.4 | |  
| FR4.5 | |
| FR4.6 | |  
| FR4.7 | |  
| FR4.8 | |  
| FR4.9 | |  
| FR5 | |  
| FR5.1 | |  
| FR5.2 | |  
| FR5.3 | |  
| FR5.4 | |  
| FR5.5 | |
| FR5.6 | |
| FR6 | |  
| FR6.1 | |  
| FR6.2 | |  
| FR6.3 | |  
| FR6.4 | |  
| FR6.5 | |
| FR6.6 | |
| FR6.7 | |
| FR7 | |  
| FR7.1 | |  
| FR7.2 | |  
| FR7.3 | |  
| FR7.4 | |  
| FR7.5 | |

## Coverage white box

![ReportImages](assets/Images/CoverageScreen.png)

Note:
The "Uncovered Lines" are the sections corresponding to "Errors 500" within the try-catch blocks.
