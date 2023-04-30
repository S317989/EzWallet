# Project Estimation - FUTURE
Date: 27/04/2023

Version: 3.0 --> Final Release


# Estimation approach
Consider the EZWallet  project in FUTURE version (as proposed by the team), assume that you are going to develop the project INDEPENDENT of the deadlines of the course

# Estimate by size 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |            4 + 8 = 12                 |             
|  A = Estimated average size per class, in LOC       |          (LOC=6000)  =Average size of a class = Total LOC / Number of classes Average size of a class = 6000 / 12 Average size of a class = 500 LOC | 
| S = Estimated size of project, in LOC (= NC * A) | 6000 LOC|
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |  600ph                                   |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) |18,000 euros | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |      Estimated Calendar Time = Estimated Effort / (Team Size x Hours per Day x Days per Week)=600/(4 * 5 * 8) =3.8 ~20daysweeks      |               

# Estimate by product decomposition
|         component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|requirement document    |57ph|
| GUI prototype |15ph|
|design document |5ph|
|code |6000/40=150ph|
| unit tests |10ph|
| api tests |8ph|
| management documents  |16ph|



# Estimate by activity decomposition
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|doing the estimation|16ph|  
|requirement document |40ph|  
|creating GUI |32ph| 
|writing the code|64ph|  
|creating linking and backend|8ph| 
|testing functionalities|8ph| 
|testing GUI in live field|8ph|

### Gantt
![Gantt_V2](/assets/Images/GanttDiagram_V2.png)

# Summary

Report here the results of the three estimation approaches. The  estimates may differ. Discuss here the possible reasons for the difference

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size |600|Estimated duration = Estimated effort / Productivity rate--> 600/10=60|
| estimate by product decomposition |206|Estimated duration = Estimated effort / Productivity rate--> 206/10=20.6|
| estimate by activity decomposition |176|Estimated duration = Estimated effort / Productivity rate--> 176/10=17.6|

Each estimation approach involves different assumptions and methodologies, which can lead to differences in the estimates obtained. For example, size estimation assumes a fixed productivity rate, whereas activity decomposition and product decomposition take into account the actual productivity rate of the development team.
In conclusion, each estimation approach has its strengths and weaknesses, and the estimates obtained can vary based on the approach used. It is important to consider multiple estimation approaches and to adjust the estimates based on feedback and actual project progress to arrive at a more accurate estimate.




