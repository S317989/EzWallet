# Graphical User Interface Prototype  - CURRENT

Authors: Gaudino Andrea Alessandro, Ugoccioni Lorenzo

Date: 27/04/2023

Version: 3.0

Software: Balsamiq

<link rel="stylesheet" type="text/css" media="all" href="./markdownStyle.css" />

<hr>

## Extraction and representation from the code
From the functionality in the Requirements Documents, we have designed an user interface to make the experience in using the application excellent.
<hr>

### **Main Page**

When a user is logged in, he has access to single interface that show the wallet's principal components.

A central bar to show the total balance.

A top red bar contains:
- the name of the wallet and a link used to share the access to this wallet, on the center;
- application logo on the left;
- user icon on the right that will, if clicked, show a simple user menu;

On top of the transaction's list there is a "search by category" field used to select only some specific transaction.

![GUIs](/assets/GUIs%20-%20V1/4.%20Main%20Page.png)

The main portion of the page is occupied by the transaction's list. Each transaction field contains it main information: title, amount, date and the category . A little arrow is used only to show if the transaction is an expense or an income.

The red button at the bottom is used to insert a new transaction.

<hr>

#### **User menu**

If the user click on the icon on the top-right, it will appear a user menu. The functionality that can be selected are: general settings; check and manage the user profile; find the user who use the wallet (application of *getUser()* function); the Logout button.

![GUIs](/assets/GUIs%20-%20V1/4.B%20Main%20Page%20with%20setting%20open.png)

<hr>

#### **Transaction Analysis**

The page will show the information related to the transaction:
- its title;
- the category;
- the color label;
- the amout;
- the date; 

![GUIs](/assets/GUIs%20-%20V1/5.%20Info%20page%20about%20a%20transaction.png)

The three buttons in the page allows him to:
- Comeback to the previous page
- Modify the current transaction (same page as a new transaction)
- Delete the current transaction

With the bar at the bottom the user can navigate back and forth between the transaction.

<hr>

#### **Login Page**

The first page is the login page, that show the general information about the applitcation. This is a regular login page with Username and Password fied, a link to use in case that you forgot your credentials and a checkbox to reember the user for the future access.

![GUIs](/assets/GUIs%20-%20V1/1.%20Log%20in%20Portal.png)

The link at the bottom will guide a new user to the register page.

<hr>

#### ***Register now* interface**

A new user can register itself compiling the fields which are shown here. The form will be sent by pressing the *Register now* button.

![GUIs](/assets/GUIs%20-%20V1/2.%20Register%20interface.png)

A link at the bottom resend the user to the previous page if he already have an account.

<hr>

#### **New Transaction**

In this page the user have to compile all the field in order to register correctly a new transaction. In the top-left corner there's an arrow used to undo the process.

The category will be choose in another page. The date can't be chosen and that of the current day will be assigned.


![GUIs](/assets/GUIs%20-%20V1/6.%20New%20Transaction.png)

The user that execute the transaction is not saved as a relevant information.

<hr>

#### **Selection of Categories**

This page is used to select between the different category, with its color, the one that fits better our transaction. If a category is not present, the user can add it manually.

![GUIs](/assets/GUIs%20-%20V1/7.%20Select%20Categories.png)