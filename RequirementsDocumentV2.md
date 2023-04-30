# Requirements Document - future EZWallet

Date: 27/04/2023

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

 
| Version number | Change |
| ----------------- |:-----------|
| 1.0 | Work until FR and NFR | 
| 2.0 | Use cases and UCD | 
| 3.0 | Glossary done | 
| 3.1 | System Design and Deployment revisited | 
| 4.0 | Business Model Canvas added | 
| 5.0 | Final Release | 


# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
    	+ [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description
EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.



# Stakeholders


| Stakeholder name  | Description | 
| ----------------- |:-----------:|
|   Application Developers      | [Internal] Who develops and maintains the application. (Us in this case)            | 
|   Application Hosting Managers      | [Internal] The employees of the company that provides the hosting service for the application.             | 
|   End Users    | [External] The users (families included) who will use the application.            | 
|   Admin    | [External] The users who create a family wallet and add all the other members.            | 
|   Regulatory Bodies    | [External] Regulators and supervisory authorities who guarantee the transactions conformity and the application conformity.             | 
|   Marketing Partners    | [External] The companies who publish the application through different services like social and pubblicity.            | 
|   Mobile Store    | [External] The store in which the application will be published.           | 

# Context Diagram and interfaces

## Context Diagram
![ContextDiagram_V2](/assets/Images/ContextDiagram_V2.png)

## Interfaces
| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| -----:|
|   User     | GUIs | Mobile Phone, Internet Connection |
|   Marketing Partners     | GUIs, APIs, Communication Protocols (HTTP, FTP, SMTP), Marketing Platforms (Google Ads) | Input/Output Devices (Screen, Keyboard, Mobile Phone) Internet Connection, Storage Devices () |
|   Admin     | GUIs | Mobile Phone, Internet Connection |
|   Hosting Provider     | GUIs | Input/Output Devices (Screen, Keyboard, Mobile Phone), Server, Internet Connection  |
|   Regulatory Bodies     | GUIs, Reporting Interfaces, Communication Protocols (HTTPS, SSL)  | Input/Output Devices (Screen, Keyboard, Mobile Phone), Internet Connection  |
|   Developers     | GUIs, Communication Protocols (HTTP, TCP/IP) | Input/Output Devices (Screen, Keyboard, Mobile Phone), Internet Connection  |

# Stories and personas
| Persona | General Info | How he/she interacts |
| ------------- |:-------------:| -----:|
| Father | Male, Middle Age, General user or Admin | He could has a high number of transactions (also recurrent one), for example shopping, bills, insurances. In addition, as admin, he have to manage the family members. |
| Mother | Female, Middle Age, General user or Admin | She could has a high number of transactions (also recurrent one), for example shopping, bills, insurances. In addition, as admin, she have to manage the family members. |
| Son | Male, legal Age, General user | He could has a high number of transactions (not mainly recurrent one), for example presents for girlfriend, dinner with friends, coffee at University |
| Daughter | Female, young Age, General user | She could has a low number of transactions, for example lunch with friends, presents for herself |

# Functional and non functional requirements

## Functional Requirements

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1     | Authorization & Authentication |
|  &emsp; FR1.1   | SignIn |
|  &emsp; FR1.2   | LogIn |
|  &emsp; FR1.3   | LogOut |
|  &emsp; FR1.4   | Recover Password |
|  FR2     | Wallet Management |
|  &emsp; FR2.1     | Create new Wallet |
|  &emsp; FR2.2     | Add Member to Wallet |
|  &emsp; FR2.3     | Remove Member from Wallet |
|  FR3     | Transactions Management |
|  &emsp; FR3.1     | See Balance amount |
|  &emsp; FR3.2     | See Transactions List with Category |
|  &emsp; FR3.3     | Add New Transaction |
|  &emsp; FR3.4     | Filter Transactions |
|  &emsp; FR3.5     | See Transactions and Balance by Date |
|  FR4     | Exchanges Management |
|  &emsp; FR4.1     | See Credits and Debts amount |
|  &emsp; FR4.2     | See Total Amount after Credits and Debts paid |
|  &emsp; FR4.3     | See Credits List |
|  &emsp; FR4.4     | See Debts List |
|  &emsp; FR4.5     | Add New Credit |
|  &emsp; FR4.6     | Add New Debt |
|  &emsp; FR4.7     | Mark Credit as paid |
|  &emsp; FR4.8     | Mark Debt as paid |
|  &emsp; FR4.9     | Filter Credits and Debts List |
|  FR5     | Documentation Management |
|  &emsp; FR5.1     | See Document List |
|  &emsp; FR5.2     | See Document Preview |
|  &emsp; FR5.3     | Add new Document Description |
|  &emsp; FR5.4     | Upload new Document Scan |
|  &emsp; FR5.5     | Filter Document List |
|  &emsp; FR5.6     | Remove Document |
|  FR6     | Graph Management |
|  &emsp; FR6.1     | See Transactions with Pie Chart View |
|  &emsp; FR6.2     | See Transactions with Line Chart View |
|  &emsp; FR6.3     | Filter Charts (both) by Date |
|  &emsp; FR6.4     | Filter Charts (both) by Date |
|  &emsp; FR6.5     | Compare Transactions List with Pie Chart View |
|  &emsp; FR6.6     | Compare Transactions List with Line Chart View |
|  &emsp; FR6.7     | Filter Comparing by Dates |
|  FR7     | Scheduled Management |
|  &emsp; FR7.1     | See Scheduled Transaction Balance |
|  &emsp; FR7.2     | See Total Balance |
|  &emsp; FR7.3     | See Scheduled Transaction List |
|  &emsp; FR7.4     | Mark Scheduled Transaction as Recurrent |
|  &emsp; FR7.5     | Filter Scheduled Transaction List |

## Non Functional Requirements

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     | Security  | The system must ensure the privacy and protection of users' personal data, through the adoption of encryption techniques. | FR1 |
|  NFR2     | Security  | The system must ensure the functionalities protection accessible only by admin  | FR2.2 |
|  NFR3     | Reliability | The system must always be available and accessible to users, to ensure service continuity and user satisfaction. | FR*|
|  NFR4     | Reliability | The system must always show the correct amount of Balance and Transaction values, also representing the correct coin. | FR* |
|  NFR5     | Reliability | The system must always keep updated all the datas and infos inside the application, in order to make the application reliabl. | FR* |
|  NFR6     | Usability | The system must be used with no specific training for the users. | FR* |
|  NFR7     | Usability | The system must be easy to use and intuitive for users, with a user-friendly interface and clear and understandable functionality. | FR* |
|  NFR8     | Usability | The system should be able to support different languages to meet the needs of users from different geographic regions. | FR* |
|  NFR9     | Scalability | The system must be able to handle an increasing number of users and transactions without compromising performance and service availability. | FR1.1 |
|  NFR10     | Maintainability | The system must be easily maintainable and modular, with a well-designed architecture and complete and up-to-date documentation. | FR* |
|  NFR11     | Performance | All functions should complete in < 0.5 sec. | FR* |

<br>

# Use case diagram and use cases

## Use case diagram

!["UseCaseDiagram_V2](/assets/Images/UseCaseDiagram_V2.png)

### Use case 1, UC1 - Authorization and Authentication
| Actors Involved        | User (General User & Admin)  |
| ------------- |:-------------:| 
|  Precondition     | / |
|  Post condition     | / |
|  Nominal Scenario     | The user could decide to register in the application after compiling a form (SignIn). |
|  Variants     | The user would like to log in into the application after entering the credentials (LogIn). <br> Also, he would like to log out from the application (LogOut) |
|  Exceptions     | Form compiled badly (SignIn), Credentials Wrong (LogIn) or User not Authenticated (LogOut) |

##### Scenario 1.1
| Scenario 1.1 | SignIn |
| ------------- |:-------------:| 
|  Precondition     | The user doesn't alread have an account with same credentials  |
|  Post condition     | The user will have a new account with credentials inserted |
| Step#        | Description  |
|  1     | User "X" inserts username |  
|  2     | User "X" inserts email |  
|  3     | User "X" inserts password |
|  4     | User "X" repeats password |

##### Scenario 1.2
| Scenario 1.2 | LogIn |
| ------------- |:-------------:| 
|  Precondition     | The user has got an account |
|  Post condition     | The user will be logged in |
| Step#        | Description  |
|  1     | User "X" inserts username |  
|  2     | User "X" inserts password |

##### Scenario 1.3
| Scenario 1.3 | LogOut |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in. |
|  Post condition     | The user will be slogged out. |
| Step#        | Description  |
|  1     | User "X" clicks button "LogOut" |  

<hr>

### Use case 2, UC2 - Family members Management
| Actors Involved        | Admin |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in with Admin Privileges |
|  Post condition     | A new user "Y" will be added to family wallet |
|  Nominal Scenario     | The wallet admin wants to add a new member to his family wallet |
|  Variants     | The user "X" wants to remove a member from the wallet. |
|  Exceptions     | User logged in not as Admin, New member not found. |

##### Scenario 2.1
| Scenario 2.1 | Add new member |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in with Admin Privileges  |
|  Post condition     | A new user "Y" will be added to family wallet |
| Step#        | Description  |
|  1     | User "X" goes to wallet settings |  
|  2     | User "X" inserts email of User "Y" |  
|  3     | User "X" clicks "Save" |  
|  4     | User "Y" receives an invite to Family Wallet |

##### Scenario 2.2
| Scenario 2.2 | Remove member |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in with Admin Privileges  |
|  Post condition     | A new user "Y" will be removed from family wallet |
| Step#        | Description  |
|  1     | User "X" goes to wallet settings |  
|  2     | User "X" inserts email of User "Y" |  
|  3     | User "X" clicks "Remove member" and System checking |  
|  4     | User "Y" receives an email with removing informations |

<hr>

### Use case 3, UC3 - Transaction Management
| Actors Involved        | User (General User & Admin) |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in |
|  Post condition     | The transactions list will be displayed or a new transaction "T" will be added to the wallet |
|  Nominal Scenario     | The user wants to add a new transaction "T" made in date "D" with a category "C" and amount "A" |
|  Variants     | The user wants to filter the transactions list. |
|  Exceptions     | Selected category not found |

##### Scenario 3.1
| Scenario 3.1 | Add new transaction |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | A new transaction "T" will be added to the wallet |
| Step#        | Description  |
|  1     | User "X" goes to Transaction Page |  
|  2     | User "X" inserts the Transaction Description |  
|  3     | User "X" inserts the Transaction Date |  
|  4     | User "X" inserts the Transaction Category |
|  5     | User "X" inserts the Transaction Cost |
|  6     | User "X" clicks "Save" |

##### Scenario 3.2
| Scenario 3.2 | Filter transactions list |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The transactions list will display only the transactions according to filters |
| Step#        | Description  |
|  1     | User "X" goes to Transaction Page |  
|  2     | User "X" clicks filter and selects the filters he wants |  

<hr>

### Use case 4, UC4 - Exchanges Management
| Actors Involved        | User (General User & Admin) |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in |
|  Post condition     | The user will see "Credits" section or "Debts" section or a New Credit/Debts will be added |
|  Nominal Scenario     | The user wants to see the credits or debts he got  |
|  Variants     | The user wants to add a new credit "C" or debt "D". <br> The user wants to mark a credit or debt as "Paid" |
|  Exceptions     | Selected category not found |

##### Scenario 4.1
| Scenario 4.1 | Add new Credit/Debt |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | A new credit "C" or debt "D" will be added to the wallet |
| Step#        | Description  |
|  1     | User "X" goes to Exchanges Page |  
|  2     | User "X" inserts the Credit/Debt Description |  
|  3     | User "X" inserts the Credit/Debt Date |  
|  4     | User "X" inserts the Credit/Debt Category |
|  5     | User "X" inserts the Credit/Debt Cost |
|  6     | User "X" clicks "Save" |

##### Scenario 4.2
| Scenario 4.2 | Mark Credit/Debt as "Paid" |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The credit "C" or debt "D" will be marked as "Paid" |
| Step#        | Description  |
|  1     | User "X" goes to Exchanges Page |  
|  2     | User "X" choose a Credit/Debt |  
|  3     | User "X" select the corresponding side checkbox |

##### Scenario 4.3
| Scenario 4.3 | Filter Exchanges list |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The exchanges list will display only the exchanges according to filters |
| Step#        | Description  |
|  1     | User "X" goes to Exchanges Page |  
|  2     | User "X" clicks filter and selects the filters he wants | 

<hr>

### Use case 5, UC5 - Documentation Management
| Actors Involved        | User (General User & Admin) |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in |
|  Post condition     | The documentation list will be showed or a new Document will be added |
|  Nominal Scenario     | The user wants to see the documents he added  |
|  Variants     | The user wants to add a new Document |
|  Exceptions     | Image not found, Image size too large, Image format not allowed |

##### Scenario 5.1
| Scenario 5.1 | Add new Document |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | A new Document "D" will be added to the wallet |
| Step#        | Description  |
|  1     | User "X" goes to Documentation Page |  
|  2     | User "X" inserts the Document Description |  
|  3     | User "X" inserts the Document Date |  
|  4     | User "X" inserts the Document Category |
|  5     | User "X" upload the Document Scan |
|  6     | User "X" clicks "Save" |

##### Scenario 5.2
| Scenario 5.2 | Filter Documentation list |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The documentation list will display only the documents according to filters |
| Step#        | Description  |
|  1     | User "X" goes to Documentation Page |  
|  2     | User "X" clicks filter and selects the filters he wants | 

##### Scenario 5.3
| Scenario 5.3 | Upload Document Scan |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The corresponding document preview will be available  |
| Step#        | Description  |
|  1     | User "X" goes to Documentation Page |  
|  2     | User "X" choose a document and update its scan | 

<hr>

### Use case 6, UC6 - Graph Management
| Actors Involved        | User (General User & Admin) |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in |
|  Post condition     | Different charts will be showed to the user |
|  Nominal Scenario     | The user wants to see a graphical representation of the transactions  |
|  Variants     | The user wants to compare two graphical representation |
|  Exceptions     | The selected date doesn't produced anything  |

##### Scenario 6.1
| Scenario 6.1 | Choose Graph |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The graphical representation with the selected type of graph (Pie - Line) is showed |
| Step#        | Description  |
|  1     | User "X" goes to Graph Page - Graph section |  
|  2     | User "X" chooses the graph type (Pie - Line) |  
|  3     | User "X" selects a date |

##### Scenario 6.2
| Scenario 6.2 | Compare Graphs |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The comparison of the selected graph is showed |
| Step#        | Description  |
|  1     | User "X" goes to Graph Page - Compare section |  
|  2     | User "X" chooses the graphs type (Pie - Line) |  
|  3     | User "X" selects the dates that he wants to compare |

<hr>

### Use case 7, UC7 - Scheduled Management
| Actors Involved        | User (General User & Admin) |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in |
|  Post condition     | The scheduled transaction list will be showed or a new Scheduled Transaction will be added |
|  Nominal Scenario     | The user wants to see the scheduled transaction  |
|  Variants     | The user wants to add a new scheduled transaction. <br> The user wants to mark a scheduled transaction as "Recurrent" |
|  Exceptions     | Category not found |

##### Scenario 7.1
| Scenario 7.1 | Add new Scheduled Transaction |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | A new Scheduled Transaction "ST" will be added to the wallet |
| Step#        | Description  |
|  1     | User "X" goes to Scheduled Page |  
|  2     | User "X" inserts the Scheduled Transaction Description |  
|  3     | User "X" inserts the Scheduled Transaction Date |  
|  4     | User "X" inserts the Scheduled Transaction Category |
|  5     | User "X" upload the Scheduled Transaction Cost |
|  6     | User "X" clicks "Save" |

##### Scenario 7.2
| Scenario 7.2 | Mark Scheduled Transaction as "Recurrent" |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The Scheduled Transaction "ST" will be marked as "Recurrent" |
| Step#        | Description  |
|  1     | User "X" goes to Scheduled Page |  
|  2     | User "X" choose a Scheduled Transaction |  
|  3     | User "X" select the corresponding side checkbox |

##### Scenario 7.3
| Scenario 7.3 | Filter Scheduled Transaction list |
| ------------- |:-------------:| 
|  Precondition     | The user "X" must be logged in  |
|  Post condition     | The scheduled list will display only the transaction according to filters |
| Step#        | Description  |
|  1     | User "X" goes to Scheduled Page |  
|  2     | User "X" clicks filter and selects the filters he wants | 

# Glossary

!["ClassDiagram_V2](/assets/Images/UMLClassDiagram_V2.png)

# System Design
![SystemDesign_V1](/assets/Images/SystemDiagram_V2.png)

# Deployment Diagram 

![DeploymentDiagram_V2](/assets/Images/DeploymentDiagram_V2.png)

# Business Model Canvas

![BMC_V2](assets/Images/BMC.png)
