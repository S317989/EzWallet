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

![Dependency_graph](assets/Images/Dependency%20graph.png)
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

<Report in the following table the coverage of functional requirements (from official requirements) >

| Functional Requirements covered | Test(s) |
| ------------------------------- | ------- |
| FRx                             |         |
| FRy                             |         |
| ...                             |         |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
