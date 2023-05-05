# Requirements Document - current EZWallet

Date: 27/04/2023

Version: V1 - description of EZWallet in CURRENT form (as received by teachers)

| Version number | Change                           |
| -------------- | :------------------------------- |
| 1.0            | First Version of the RD          |
| 1.1            | Removing not present in the code |
| 2.0            | Final release                    |

# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
  - [Use cases](#use-cases) + [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description

EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.

# Stakeholders

| Stakeholder name             |                                                            Description                                                            |
| ---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------: |
| Application Owner            | [Internal] The owners of the application. (They could be directly us or the company that commissioned us to develop the software) |
| Application Developers       |                             [Internal] Who develops and maintains the application. (Us in this case)                              |
| Application Hosting Managers |                  [Internal] The employees of the company that provides the hosting service for the application.                   |
| Users                        |                                        [External] The users who will use the application.                                         |

# Context Diagram and interfaces

## Context Diagram

![Context Diagram](/assets/Images/ContextDiagram_V1.png)

## Interfaces

| Actor            | Logical Interface |                            Physical Interface |
| ---------------- | :---------------: | --------------------------------------------: |
| User             |       GUIs        |         Screen, Keyboard, Internet Connection |
| Hosting Provider |       GUIs        | Screen, Keyboard, Server, Internet Connection |

# Stories and personas

| Persona  |             General Info              |                                                                                                                                                             How he/she interacts |
| -------- | :-----------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Parents  | Male/Female, Middle Age, General user | He/she could has a high number of transactions (family expenses and/or recurrent ones), like insurances, healtcare, bills. Interested in supervising the other members' expenses |
| Son      |     Male, legal Age, General user     |                    He could has a high number of transactions (not recurrent, probably frequent), for example presents for girlfriend, dinner with friends, coffee at University |
| Daughter |    Female, young Age, General user    |                                                                        She could has a low number of transactions (random), for example lunch with friends, presents for herself |

\<stories will be formalized later as scenarios in use cases>

# Functional and non functional requirements

## Functional Requirements

| ID                   |          Description           |
| -------------------- | :----------------------------: |
| FR1                  | Authorization & Authentication |
| &emsp; FR1.1         |             SignIn             |
| &emsp; FR1.2         |             LogIn              |
| &emsp; FR1.3         |             LogOut             |
| FR2                  |    Transactions Management     |
| &emsp; FR2.1         |      Add New Transaction       |
| &emsp; FR2.2         |       Select Transaction       |
| &emsp;&emsp; FR2.2.1 |  See Transaction Information   |
| &emsp; FR2.3         |       Delete Transaction       |
| FR3                  |      Category Management       |
| &emsp; FR3.1         |        Select Category         |
| &emsp; FR3.2         |        Add New Category        |
| &emsp;&emsp; FR3.2.1 |     Define Category Title      |
| &emsp;&emsp; FR3.2.2 |     Define Category Color      |

## Non Functional Requirements

| ID   | Type (efficiency, reliability, ..) |                                                                 Description                                                                 | Refers to |
| ---- | :--------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------: | --------: |
| NFR1 |              Security              |          The system must ensure the privacy and protection of users' personal data, through the adoption of encryption techniques.          |       FR1 |
| NFR2 |            Reliability             |              The system must always be available and accessible to users, to ensure service continuity and user satisfaction.               |      FR\* |
| NFR3 |             Usability              |     The system must be easy to use and intuitive for users, with a user-friendly interface and clear and understandable functionality.      |      FR\* |
| NFR4 |             Usability              |           The system should be able to support different languages to meet the needs of users from different geographic regions.            |      FR\* |
| NFR5 |            Scalability             | The system must be able to handle an increasing number of users and transactions without compromising performance and service availability. |     FR1.1 |
| NFR6 |          Maintainability           |      The system must be easily maintainable and modular, with a well-designed architecture and complete and up-to-date documentation.       |      FR\* |

# Use case diagram and use cases

## Use case diagram

!["UseCaseDiagram"](/assets/Images/UseCaseDiagram_V1.png)

\<next describe here each use case in the UCD>

### Use case 1, UC1 - Authentication

| Actors Involved  |                           User                           |
| ---------------- | :------------------------------------------------------: |
| Precondition     |                            /                             |
| Post condition   |                            /                             |
| Nominal Scenario |      The user wants to SignIn into the application       |
| Variants         | The user wants to LogIn. <br> The user wants to LogOut.  |
| Exceptions       | Wrong credentials Wrong ( "wrong password or username ") |

##### Scenario 1.1

| Scenario 1.1   |                SignIn                 |
| -------------- | :-----------------------------------: |
| Precondition   |       The user isn't registered       |
| Post condition | a new account for the user is created |
| Step#          |              Description              |
| 1              |   the user launches the application   |
| 2              |  the user clicks on "register now "   |
| 3              |    the user types in the username     |
| 4              |      the user types in the email      |
| 5              |    the user types in the password     |
| 6              |    the user confirms the password     |
| 7              |   the user clicks on "regiter now"    |

##### Scenario 1.2

| Scenario 1.2   |               LogIn               |
| -------------- | :-------------------------------: |
| Precondition   |    The user has got an account    |
| Post condition |    The user will be logged in     |
| Step#          |            Description            |
| 1              | the user launches the application |
| 2              |  the user types in the username   |
| 3              |  the user types in the password   |
| 4              |     the user clicks on login      |

##### Scenario 1.3

| Scenario 1.3   |                               LogOut                                |
| -------------- | :-----------------------------------------------------------------: |
| Precondition   |                       The user is logged in.                        |
| Post condition |                       The user is logged out.                       |
| Step#          |                             Description                             |
| 1              | the user clicks button "LogOut" and is transfered to the login page |

<hr>

### Use case 2, UC2 - transaction management

| Actors Involved  |                                         user                                         |
| ---------------- | :----------------------------------------------------------------------------------: |
| Precondition     |                            user logged in and authorized                             |
| Post condition   |                  transaction managed ( added / deleted / selected )                  |
| Nominal Scenario |                         The user wants to add a transaction.                         |
| Variants         | The user wants to delete a transaction. <br> The user wants to select a transaction. |
| Exceptions       |                  incomplete incomplete information , invalid input                   |

##### Scenario 2.1

| Scenario 2.1   |                                          Add new transaction                                           |
| -------------- | :----------------------------------------------------------------------------------------------------: |
| Precondition   |                                     user logged in and authorized                                      |
| Post condition |                                         new transaction added                                          |
| Step#          |                                              Description                                               |
| 1              |                                   the user launches the application                                    |
| 2              |                                           the user loggs in                                            |
| 3              |                                  the user clicks on the " + " button                                   |
| 4              |                        the user types in the title , the category and the value                        |
| 5              |                                   the user confirms the transaction                                    |
| 6              | the user can view the transaction in the transaction history with the title , the date , and the value |

##### Scenario 2.2

| Scenario 2.2   |                                      select a transaction                                       |
| -------------- | :---------------------------------------------------------------------------------------------: |
| Precondition   |                                      The user is logged in                                      |
| Post condition |                             transactions informations are displayed                             |
| Step#          |                                           Description                                           |
| 1              |                                the user launches the application                                |
| 2              |                                      the user is logged in                                      |
| 3              |                     the history of transactions is displayed on the screen                      |
| 4              |                  the user selects a transaction by clicking on the desired one                  |
| 5              | a page is diplayed where all the informations are written ( name , category , amount , date ..) |

##### Scenario 2.3

| Scenario 2.2   |                                                        delete a transaction                                                         |
| -------------- | :---------------------------------------------------------------------------------------------------------------------------------: |
| Precondition   |                                                        The user is logged in                                                        |
| Post condition |                                                     the transaction is deleted                                                      |
| Step#          |                                                             Description                                                             |
| 1              |                                      the user follows the scenario of selecting a transaction                                       |
| 2              | when the page belonging to a certain transaction is displayed , the user can easily delete it by clicking on « delete transaction » |

<hr>

### Use case 3, UC3 - category Management

| Actors Involved  |                User (General User & Admin)                 |
| ---------------- | :--------------------------------------------------------: |
| Precondition     |                   The user is logged in                    |
| Post condition   |            category managed (added / selected )            |
| Nominal Scenario | the user wants to manage a category ( add it / select it ) |
| Variants         |            the user wants to delete a category             |
| Exceptions       |                 category already existing                  |

##### Scenario 3.1

| Scenario 3.1   |           select a category           |
| -------------- | :-----------------------------------: |
| Precondition   |         The user is logged in         |
| Post condition |        A category is selected         |
| Step#          |              Description              |
| 1              |           the user logs in            |
| 2              |    the user adds a new transaction    |
| 3              | the users selects the category wanted |
| 4              |     the category is then selected     |

##### Scenario 3.2

| Scenario 3.2   |                                add a new category                                 |
| -------------- | :-------------------------------------------------------------------------------: |
| Precondition   |                               The user is logged in                               |
| Post condition |                              a new category is added                              |
| Step#          |                                    Description                                    |
| 1              |                                 the user logs in                                  |
| 2              |                          the user adds a new transaction                          |
| 3              |  the user decides to add a new category , so he clicks on the corresponding icon  |
| 4              | a screen is displayed where the user types in title and the color of the category |
| 5              |                              a new category is added                              |

<hr>

# Glossary

!["UseCaseDiagram"](/assets/Images/UMLClassDiagram_V1.png)

# System Design

!["SystemDiagram"](/assets/Images/SystemDiagram_V1.png)

# Deployment Diagram

!["UseCaseDiagram"](/assets/Images/DeploymentDiagram_V1.png)

# Defect Table

We have found the following inconsistencies while running the code of EZWallet V1:

| Defect                                         |                                                                        Description                                                                        |
| ---------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Admin role                                     | There is a reference about an Admin User, who has more privileges, but it is not coded anywhere. So, it will be added in the next version of the project. |
| getUser()                                      |          This function is coded, but, in the version1, this method can be reached by all the users and it should be available only by the admin.          |
| getLabels(), getTransaction()                  |                           _getTransaction()_ and _getLabels()_ return a similar object, but the second one add only the color.                            |
| getTransaction(), getLabels(), getCategories() |             There is a problem of **privacy**, because all the users can see also the transactions, labels and categories of the other users.             |
