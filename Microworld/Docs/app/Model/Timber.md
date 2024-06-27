Timber in the microworld refers to wood harvested upon felling a tree, of which 50% is used as lumber and the rest is burned for energy. [(University of Wisconsin, 2020)](https://www3.uwsp.edu/cnr-ap/KEEP/Documents/Activities/Energy%20Fact%20Sheets/FactsAboutWood.pdf)

## Availability

Availability of this resource depends on how much wood was chopped each timestep. 

## Income

At the end of each simulation timestep, the amount (in kg) of wood that was harvested in that step is sold and used.

Different types of wood have differing prices. On average, the price of wood can be considered as being $1.53 per lb = $3.37 per kg = €3.15 per kg.

Thus, in the microworld, price fetched for wood shall be $\boxed{\text{3.15 coins / kg}}$.

## Expenditure

The maximum cost of felling the biggest tree in this microworld is  $\boxed{Cost_{fell}^{max} = 3000 \text{ coins}}$ [(Grasshopper Services)](https://www.grasshopperservices.ie/tree-removal-cost/). This max amount shall be multiplied by percent of full growth the tree has reached at the time of chopping. Thus, felling cost is equal to the height of the tree divided by its maximum height and then multiplied by the max felling cost. 
$$
\boxed{Cost_{fell} = \frac{Height_{tree}}{Height_{tree}^{max}} \times Cost_{fell}^{max}}
$$
