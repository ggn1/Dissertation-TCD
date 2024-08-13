Timber in the microworld refers to wood harvested upon felling a tree, of which 50% is used as lumber and the rest is burned for energy. [(University of Wisconsin, 2020)](https://www3.uwsp.edu/cnr-ap/KEEP/Documents/Activities/Energy%20Fact%20Sheets/FactsAboutWood.pdf)

## Availability

Availability of this resource depends on how much wood was chopped each timestep. 

## Income

At the end of each simulation timestep, the amount (in kg) of wood that was harvested in that step is sold and used.

In the real world, different types of wood have varying prices. On average, the price of wood can be assumed as being $1.5 per lb = $3.3 per kg $\approx$ €3.03 per kg. [(Lost Art Press, 2021)](https://blog.lostartpress.com/2021/03/21/buying-wood-by-the-pound/)

Thus, in the microworld, price fetched for wood shall be $\boxed{\text{3 coins / kg}}$.

## Expenditure

The maximum cost of felling the biggest tree in this microworld is  $\boxed{Cost_{fell}^{max} = 3000 \text{ coins}}$ [(Grasshopper Services)](https://www.grasshopperservices.ie/tree-removal-cost/). This max amount shall be multiplied by percent of full growth the tree has reached at the time of chopping. Thus, felling cost is equal to the height of the tree divided by its maximum height and then multiplied by the max felling cost. 
$$
\boxed{Cost_{fell} = \frac{Height_{tree}}{Height_{tree}^{max}} \times Cost_{fell}^{max}}
$$
