The land is a grid with 6 rows and 6 columns amounting to a total of $\boxed{36 \text{ spots}}$. Each spot may host 1 live [[Tree]]. Thus, this land can contain up to 36 living trees.

If trees are grown in rows with average distance between them being $21 \text{ ft}$ and the average distance between rows being $25\text{ ft}$, then $1 \text{ acre}$ of could contain $83$ trees. [(tree plantation)](https://treeplantation.com/tree-spacing-calculator.html)  Therefore, 36 trees could occupy 0.43 acres = 1740.15 $m^2$. 

Thus, the size of land in this microworld for all computations may be $\boxed{1740 \text{ m}^2}$. 

This is too small to represent the size of a real forest (the average size of a privately owned forest in Ireland is around 8 ha = $8 \times 10^4$ ha [(SWS Forestry)](https://swsforestry.ie/why-plant/forestry-facts/)). But, given only 36 trees in this microworld, scaling real world figures associated with forests such that they are relevant to a 1740 $m^2$ piece of land should help map real world interactions to those in the microworld more accurately.

Land content determines the [[Biodiversity]] of the land which influences tree growth rate, ability of trees to recover from stress and money earned from some income streams.
## Spot Availability

In this microworld A spot on land is considered free and available for new growth if any one of the following is true.
* There are no trees in the spot.
* There is a only one dead tree in the spot such that it has decayed to the point where $Height_{tree} \leq 0.5 \times Height_{tree}^{max}$. This emulates how in nature, new growth may arise from the remains of a dead tree even as it is still decaying.

Thus, each  spot on land can have at most one live tree. 

In code, each position in the 2D $6\times6$ grid representing the land is mapped to a list. This list may only ever contain at most 2 Tree objects. The object at position 0 in this land spot list is the latest addition to the land spot and is always the only object that gets displayed on the UI.