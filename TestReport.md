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
|getGroups - Success|usersMethods.getGroups|wb - Statement|
|getGroups - Unauthorized|usersMethods.getGroups|wb - Branches|
|getGroup - Group doesn't exist|usersMethods.getGroups|wb - Branches|
|getGroup - Admin - Success|usersMethods.getGroups|wb - Statement|
|getGroup - Admin - Unauthorized|usersMethods.getGroups|wb - Branches|
|DeleteUser - Unauthorized|usersMethods.deleteUser|wb - Branches|
|DeleteUser - No email provided|usersMethods.deleteUser|wb - Branches|
|DeleteUser - Invalid email format|usersMethods.deleteUser|wb - Branches|
|DeleteUser - User not found|usersMethods.deleteUser|wb - Branches|
|DeleteUser - Admin not removable|usersMethods.deleteUser|wb - Branches|
|DeleteGroup - Success|usersMethods.deleteUser|wb - Statement|
|DeleteGroup - Unauthorized|usersMethods.deleteUser|wb - Statement|
|DeleteGroup - Missing group name|usersMethods.deleteUser|wb - Statement|
|DeleteGroup - Group doesn't exist|usersMethods.deleteUser|wb - Statement|




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
|FR22 |"getGroups" : "GetUsers - Success" / "GetUsers - Unauthorized" |
|FR23 |"getGroup" : "GetGroup - Group doesn't exist" <br> 1 - "Admin" : "GetGroup - Admin - Success" / "GetGroup - Admin - Unauthorized" <br> 2 - "User" : "GetGroup - User - Success" / "GetGroup - User - Unauthorized" / "GetGroup - User - User not found" / "GetGroup - User - User not in group"  | 
| FR24 | "addToGroup" = "AddToGroup - Success"/ "AddToGroup - Group not found" / "AddToGroup - No emails provided" / "AddToGroup - User doesn't exist or already in group" | 
| FR26 |"RemoveFromGroup" = "RemoveFromGroup - Success" / "RemoveFromGroup - Group does not exist" / "RemoveFromGroup - No emails provided" / "RemoveFromGroup - Cannot remove all members of a group" / "RemoveFromGroup - Invalid emails"  |     
| FR28 | "deleteGroup" : "DeleteGroup - Success" / "DeleteGroup - Unauthorized" / "DeleteGroup - Missing group name" / "DeleteGroup - Group doesn't exist" |



## Coverage white box

![ReportImages](assets/Images/CoverageScreen.png)

Note:
The "Uncovered Lines" are the sections corresponding to "Errors 500" within the try-catch blocks.
