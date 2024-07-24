[(I. Thompson et. al., 2009)](https://research.fs.usda.gov/treesearch/36775)

In the underlying model, there are 4 values related to biodiversity as follows.
1. Biodiversity Score $B$.
2. Biodiversity Category $B_{cat}$.
3. Biodiversity Stress Reduction Factor $Factor_{stress}^{bdRed}$.

Forests that are mixed and have trees of varying ages is considered to be healthy. Such forests harbour the most biodiversity. [(X. Wang et. al., 2019)](https://onlinelibrary.wiley.com/doi/10.1111/ddi.12972) [(L. R. Hertzog et. al., 2021)](https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/1365-2664.14013) Thus, the biodiversity score computed here will consider species and age composition of the forest. It is assumed that a forest with 50% coniferous trees and 50% deciduous ones; that is, one the shows maximum mixing of species, receives highest biodiversity score of 1.
* If no trees then species biodiversity score $B_{species}=0$.
* For each coniferous tree, if there exists a deciduous tree then $B_{species} = B_{species} + 1$.
* For each remaining coniferous or deciduous tree for which there is another tree of the same type $B_{species} = B_{species} + 0.3$.
* For each remaining coniferous or deciduous tree for which there is no tree of any type $B_{species} = B_{species} + 0.05$
* Final $B_{species}$ score shall be scaled through min max scaling to a value between 0 and 1 as $B_{species} = \frac{B_{species}}{36}$ since there are 36 spots on the land.

Healthy old growth forests contain a mixture of trees belonging to different age groups. Such forests boast rich biodiversity. Even dead trees (dead wood) contribute towards increased biodiversity (fungi, insects, etc.).  [(T. Kuuluvainen et al., 2002)](https://www.researchgate.net/publication/280265636_Tree_age_distributions_in_old-growth_forest_sites_in_Vienansalo_wilderness_eastern_Fennoscandia) [(Forestry And Land Scotland, 2020)](https://forestryandland.gov.scot/blog/biodiversity-and-you) [(T. Oijala, 2020)](https://www.metsagroup.com/metsaforest/news-and-publications/blogs/increased-biodiversity-through-mixed-forests/) .  Thus here, it is assumed that a forest most closely resembling the aforementioned real old growth forest in age composition would harbour most biodiversity and receive a score of 1 which will drop to 0 based on how much virtual forest age composition differs from that of the real forest.

Following image shows the distribution of no. of mature trees by age per hectare based on data from an old growth forest in Vienansalo Wilderness, Eastern Fennoscandia. [(T. Kuuluvainen et al., 2002)](https://www.researchgate.net/publication/280265636_Tree_age_distributions_in_old-growth_forest_sites_in_Vienansalo_wilderness_eastern_Fennoscandia)
![[tree_age_comp_mature.png]]

Similarly, the following image displays the no. of seedlings and saplings per hectare based on data from the same forest. [(T. Kuuluvainen et al., 2002)](https://www.researchgate.net/publication/280265636_Tree_age_distributions_in_old-growth_forest_sites_in_Vienansalo_wilderness_eastern_Fennoscandia)

![[tree_age_comp_seed_sap.png]]


Given below is the no. of dead tree stumps per hectare based on data from the same forest. [(T. Kuuluvainen et al., 2002)](https://www.researchgate.net/publication/280265636_Tree_age_distributions_in_old-growth_forest_sites_in_Vienansalo_wilderness_eastern_Fennoscandia)

![[tree_age_comp_dead.png]]

Since age of the oldest and youngest trees in this forest differ from that in the microworld. In order to mimic this forest age composition approximately, no. of trees of each age group in this forest was mapped to ages in the microworld using this [[Conversion Of Scale]]. 

![[tree_age_map.png]]

Based on above age groupings and tree per hectare counts, the following approximate age composition was arrived at wherein seedlings and saplings make up 15% of the forest, mature trees comprise 35% of it, old growth trees and senescent trees make up 20% of it and dead trees comprise 30% of it.

![[tree_age_prop.png]]

Calculating age related biodiversity score $B_{age}$ involves computing the following for each of the 4 age categories `seedlingSapling`, `mature`, `oldGrowthSenescent`, and `Dead`. Age group specific scores so obtained may be averaged to produce the final $B_{age}$ score.
* No of trees $= count$.
* Ideal proportion of trees of this age group, $prop_{ideal}$.
* Current proportion of trees of this age group, $prop = \frac{count}{36}\times 100$.
* Maximum possible error $error_{max} = max((100 - prop_{ideal}), (prop_{ideal} - 0))$.
* Minimum possible error $error_{min} = 0$.
* $error = abs(prop - prop_{ideal})$.
* After min-max scaling, $errorScaled = \frac{error - error_{min}}{error_{max} - error_{min}}$.
* Score = 1 - errorScaled.

The final biodiversity score is be computed as $B = (B_{species} + B_{age})/2$.

Ecosystems are more biodiverse than new forests or plantations. [(Forestry And Land Scotland, 2020)](https://forestryandland.gov.scot/blog/biodiversity-and-you)
* $0 \leq B \leq 0.25 \Rightarrow$ Biodiversity category $B_{cat} = \text{unforested}$
* $0.25 \lt B \leq 0.5 \Rightarrow$ $B_{cat} = \text{plantation}$
* $0.5 \lt B \lt 0.75 \Rightarrow$ $B_{cat} = \text{forest}$
* $0.75 \le B \leq 1.0 \Rightarrow$ $B_{cat} = \text{ecosystem}$

Forests with more biodiversity are more resilient [(Ian Thompson, 2009)](https://www.cbd.int/doc/publications/cbd-ts-43-en.pdf).
* $B_{cat} = \text{unforested} \Rightarrow Factor_{stress}^{bdRed} = 0.0$
* $B_{cat} = \text{plantation} \Rightarrow Factor_{stress}^{bdRed} = 0.01$
* $B_{cat} = \text{forest} \Rightarrow Factor_{stress}^{bdRed} = 0.1$
* $B_{cat} = \text{ecosystem} \Rightarrow Factor_{stress}^{bdRed} = 0.3$