# Project Estimation - CURRENT

Date: 27/04/2023

Version: 3.0 - Final Release

# Estimation approach

Consider the EZWallet project in CURRENT version (as received by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course

# Estimate by size

###

|                                                                                                         | Estimate                                                                                        |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| NC = Estimated number of classes to be developed                                                        | 4                                                                                               |
| A = Estimated average size per class, in LOC                                                            | 900/4 = 225                                                                                     |
| S = Estimated size of project, in LOC (= NC \* A)                                                       | 900                                                                                             |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | Estimated Effort = (900 LOC / 10 LOC per person-hour) x Complexity Factor --> 90                |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 2.700 euros                                                                                     |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 3 days Estimated Calendar Time = Estimated Effort / (Team Size x Hours per Day x Days per Week) |

# Estimate by product decomposition

###

| component name       | Estimated effort (person hours) |
| -------------------- | ------------------------------- |
| requirement document | based on FR and NFR 20ph hours  |
| GUI prototype        | 7ph for 7 screens               |
| design document      | 4ph                             |
| code                 | Effort = 900/40 = 22.5ph        |
| unit tests           | 8ph                             |
| api tests            | 4ph                             |
| management documents | 12ph                            |

# Estimate by activity decomposition

###

| Activity name                                                        | Estimated effort (person hours) |
| -------------------------------------------------------------------- | ------------------------------- |
| creating project group in telegram and Discord and get to know group | 8hp                             |
| reading project instruction                                          | 8ph                             |
| meeting on discord about project and spliting groups                 | 8ph                             |
| doing the estimation                                                 | 40ph                            |
| requirement document                                                 | 40ph                            |
| creating GUI                                                         | 40ph                            |
| writing the code                                                     | 48ph                            |
| creating linking and backend                                         | 10                              |
| testing functionalities                                              | 15ph                            |
| testing GUI in live field                                            | 5ph                             |

### Gantt Diagram

![Gantt_V1](/assets/Images/GanttDiagram_V1.png)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort | Estimated duration              |
| ---------------------------------- | ---------------- | ------------------------------- |
| estimate by size                   | 22.5 hours       | 5.6 - 7.6 hours per developer   |
| estimate by product decomposition  | 50-60 hours      | 12.5 - 15 hours per developer   |
| estimate by activity decomposition | 110-150 hours    | 27.5 - 37.5 hours per developer |

Estimated duration = Estimated effort / Number of resources

Estimate by activity decomposition:
Code development: 10 hours
Unit tests: 20-30 hours
Deployment document: 20-30 hours
Management document: 20-30 hours
API tests document: 20-30 hours
Documentation document: 20-30 hours
Total estimated time: 110-150 hours

Estimate by product decomposition:
EZWallet application: 900 lines of code
Unit tests: 25% of the code (100 lines of code)
Deployment document: 5% of the code (20 lines of code)
Management document: 5% of the code (20 lines of code)
API tests document: 5% of the code (20 lines of code)
Documentation document: 5% of the code (20 lines of code)
Total estimated time: 50-60 hours

Estimate by size:
EZWallet application: 900 lines of code
Development productivity rate: 10 LOC per person hour
Team size: 4 developers
Total estimated time: 10 hours

The estimates obtained by activity decomposition and product decomposition are higher compared to the estimate obtained by size estimation. The possible reasons for the difference in the estimates are:

Complexity: Activity decomposition and product decomposition take into account the complexity of the project, whereas size estimation only considers the size of the project. If the project is complex, the estimates obtained by activity decomposition and product decomposition will be higher than the estimate obtained by size estimation.
Detail: Activity decomposition and product decomposition involve a detailed breakdown of the project into smaller components, which allows for a more accurate estimation. Size estimation, on the other hand, only considers the size of the project, which may not provide enough detail to accurately estimate the effort required.
Assumptions: Each estimation approach involves different assumptions and methodologies, which can lead to differences in the estimates obtained. For example, size estimation assumes a fixed productivity rate, whereas activity decomposition and product decomposition take into account the actual productivity rate of the development team.
In conclusion, each estimation approach has its strengths and weaknesses, and the estimates obtained can vary based on the approach used. It is important to consider multiple estimation approaches and to adjust the estimates based on feedback and actual project progress to arrive at a more accurate estimate.
