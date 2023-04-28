# Graphical User Interface Prototype  - FUTURE

Authors: Gaudino Andrea Alessandro, Ugoccioni Lorenzo

Date: 24/04/2023

Version: 4.0

Software: Sketch

<link rel="stylesheet" type="text/css" media="all" href="./markdownStyle.css" /> 

<hr> 

## What's new
We suggest six new features for the **EzWallet** project's second version, which will give users of the application extra services. <br>
To give users a clearer view of their transactions, we are specifically introducing improvements to the application's logic as well as to the pages and services they can access. Here is a quick introduction to each of them:
- [*Logic*] Each user can have multiple wallet and can select one of them.
- [*Logic*] New application management system, based on a dynamic bottom bar.
- [*Logic*] The total Balance increase automatically when a transaction is added.
- [*Logic*] New Login and SignUp manaement system.
- [*Service*] New section of **Exchange Transactions**.
- [*Service*] New section of **Scheduled Transaction**.
- [*Service*] New section of **Graph Visualizer**.
- [*Service*] New section of **Documentation Manager**.

### Application Logic

#### **Wallet Management**
The user may want to manage their expenses across different areas, such as daily life, work, or even a simple trip, so we have first decided to introduce the possibility of having multiple different wallets.

For appropriate administration of all the wallets claimed by the client, we have presented a unused page that shows their *title*, *creation date*, *balance* and of course, the possibility to create a new one. 

![GUIs](/assets/GUIs/WalletPage.png)

In addition, if the user would like to delete a wallet, we have not implemented a real button, which may result in poor aesthetics, but we would like to implement a slider system, that allow the user to delete the selected wallet with a gesture recognition.

<hr>

#### **Bottom Bar Layout**
Given the significant number of new sections offered by the update, and, at the same time, the difficulty of managing access to them, it was necessary to develop a simple and intuitive system that allows the user to view all available pages and access them quickly.

To achieve this, we have implemented a dynamic bottom bar, allowing the user to access all the desired sections through clicking the logo button; it will expand the second bar showing a list of new pages. (The re-clicking of the logo will contract the bar)
<br>

<div id="identifier" class="doublePicSection"> 

![DoublePicSection](/assets/GUIs/BottomBarPage.png)
![DoublePicSection](/assets/GUIs/BottomBarOpenedPage.png)

</div>

<hr> 

#### **Balance Automation**
Finally, regarding the software logic, we have decided to include and display a total balance of the expenses made. 

![BalanceManagement](/assets/GUIs/BalanceManagement.png)

The balance of the expenses is organized in two different sections: the HomePage and the Transaction Page; and, according to which page is selected, it shows different values. In particular, when the balance is positioned into the HomePage, it shows the total number of transactions made since the wallet was created and the total amount of transactions made the month before. On the other hand, when the balance is positioned into the TransactionPage, it shows the total amount of transactions made according to the filter "data" is choosed.

<hr>

#### **Login**

Regarding the login management, we have updated the form system adding two new functionalities:
- The "Remember me" button, used to allow the system to remember the account associated.
- The "Forgot Password" button, used to allow the user to recover his password.

![GUIs](/assets/GUIs/LoginPage.png)

<hr>

#### **Sign Up**

Regarding the registration management, we have updated the form system adding the new field "Confirm Password", in order to have a more secure way to create a new account.

![GUIs](/assets/GUIs/SignInPage.png)

<br>

### New Services

#### **Exchange Section**

Regarding the first page we had in mind, we created the "Exchanges" section which contains information about the credits and debts that the user has. 

In particular, the total amount of credits represents the amount of money the user has borrowed from another person. The displayed information includes the description and category of the transaction, the person who lent the money, the exchange date, and the given amount. Additionally, there is a checkbox that indicates whether the credit has been paid or not.

On the other hand, by using a slider gesture in the credits section of the page, the user can view the total amount of debts they have. The information displayed is the same as that for credits, but relates to the amount of money the user has borrowed.
We have also implemented a filter function that allows the user to select which transactions to view based on categories, dates, paid status, and amount, for example.

<div class="doublePicSection">

![DoublePicSection](/assets/GUIs/ExchangeCreditsPage.png)
![DoublePicSection](/assets/GUIs/ExchangeDebtsPage.png)

</div>

P.S.: In the title section, there is a container that displays the total amount of credits and debts, as well as the amount of money the user has after all the credits and debts are paid (Total = credits - debts).

<hr>

#### **Schedule Section**

Regarding the transactions that a user can add, we have considered adding a section that contains all the future payments that the user will need to make.

This page has a similar structure to the previous one, with a title section and a body section.

In the title section, the user can see two different amounts: one for the total balance they have, and one for the total amount of money that they have scheduled to spend, in order to have a clear view of the money they will be spending.

The body section contains a list of transactions that the user will need to pay, including the description, category, and amount of each transaction, as well as the payment recipient.
Like the Exchanges section, there is a filter system, and for each transaction, there is a checkbox that indicates whether the transaction is a recurring one (for example, each year, like car insurance) or a one-time transaction.

![GUIs](/assets/GUIs/ScheduledPage.png)

<hr>

#### **Graph Section**

In addition to all the textual informations that the user can see in the application, we have implemented a section which gave to the customer a graphical representation of the transactions, named "Graph Section".

This is probably the most particular page, in fact the client can see a single body part, Interchangeable through a slider gesture, which contains two different portions: **Graph** and **Compare**.

In the first one, the user can choose between two types of graphs (**Pie Chart** and **Line Chart**) and see the corresponding visual representation of the transactions, which are also divided into categories and have a filter system by date (such as month and year).

<div class="doublePicSection">

![DoublePicSection](/assets/GUIs/PieChartPage.png)
![DoublePicSection](/assets/GUIs/LineChartPage.png)

</div>

<br>

In the second one, the user can again choose between two types of graphs (**Pie Chart** and **Line Chart**), but they can also view a graphical representation of the transactions made during two different periods. For example, they can choose to select two different months and explore the different amounts of transactions made during those periods.

<div class="doublePicSection">

![DoublePicSection](/assets/GUIs/PieChartComparePage.png)
![DoublePicSection](/assets/GUIs/LineChartComparePage.png)

</div>

<hr>

#### **Documentation Section**

Finally, in order to offer all the possible functionality that clients may request, we have implemented a documentation page that allows users to upload scanned documents.

The page displays a single body section containing a list of documents, each with a **description** and **category**, and also a system to view a preview of the uploaded scan.

![GUIs](/assets/GUIs/DocumentPage.png)