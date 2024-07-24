Trees may be one of 2 types, being **deciduous** or **coniferous**. This is to represent how a natural forest harbours multiple species of trees. 

The primary differences among the two types of trees are as follows.

| Coniferous                                                                                                                                                                                                                     | Deciduous                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maximum height $\approx(112+20)/2\approx70\text{ m}$ [(Encyclopedia Britannica)](https://www.britannica.com/plant/conifer)                                                                                                     | Maximum height $\approx(112+20)/2\approx40\text{ m}$ [(N. Moran, 2023)](https://www.dlrcoco.ie/sites/default/files/2023-03/dlr_tree_guide.pdf)                                                                                |
| Reproduction interval = 2.5 years.                                                                                                                                                                                             | Reproduction interval = 1 year.                                                                                                                                                                                               |
| Wood density = 6e+5 g/$m^3$ [(Matmatch)](https://matmatch.com/learn/property/density-of-wood)                                                                                                                                  | Wood density = 7e+5 g/$m^3$ [(Matmatch)](https://matmatch.com/learn/property/density-of-wood)                                                                                                                                 |
| Evergreen. Does not shed leaves in autumn. Thus, % of carbon lost and replenished per year in addition to growth (maintenance carbon %) = 1%.                                                                                  | Sheds all leaves in autumn and regrows them in spring. Thus, maintenance carbon = 40%.                                                                                                                                        |
| No. of years spent in each stage of life in increasing order = 4 years as a seedling, 22 years as a sapling, matures at age 26, becomes old growth at age 60 and enters the senescent stage at age 90 before dying at age 100. | No. of years spent in each stage of life in increasing order = 3 years as a seedling, 18 years as a sapling, matures at age 21, becomes old growth at age 47 and enters the senescent stage at age 70 before dying at age 80. |
Thus, in the simulated world, the maximum life expectancy of a conifer tree is 100 years while that of a deciduous tree is slightly lower at 80 years. On average conifer trees are more long lived than deciduous ones. [(F. Biondi et. al., 2023)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10011738/)

Starting Height of a Seedling $=16\text{ to }25\text{ cm}\Rightarrow20.0\text{ cm}=0.2\text{ m}$ [Tree Time Services](https://treetimeservices.ca/education/reclamation/seedling-characteristics)

| Stage      | Coniferous Age At Start | Coniferous Duration | Coniferous Age At End | Deciduous Age At Start | Deciduous Duration | Deciduous Age At End |
| ---------- | ----------------------- | ------------------- | --------------------- | ---------------------- | ------------------ | -------------------- |
| Seedling   | 0                       | 4                   | 4                     | 0                      | 3                  | 3                    |
| Sapling    | 4                       | 22                  | 26                    | 3                      | 18                 | 21                   |
| Mature     | 26                      | 34                  | 60                    | 21                     | 26                 | 47                   |
| Old Growth | 60                      | 30                  | 90                    | 47                     | 23                 | 70                   |
| Senescent  | 90                      | 10                  | 100                   | 70                     | 10                 | 80                   |
## Stress

Trees die only when $Stress \geq 1$.

Living trees are under stress due to environmental conditions (atmospheric 𝐶𝑂2 concentration) and time (age). 
$$
Stress = min(1, Stress + Stress_{env}) \quad \text{where} \quad Stress_{env} = Stress_{co2}
$$
$$
Stress = min(1, Stress+Stress_{age})
$$
Stress due to atmospheric CO2 concentration is computed based on the tree's tolerance to CO2 levels in the air. Seedlings and saplings are more vulnerable to atmospheric stress than mature trees. The following tolerance mapping between CO2 concentration and resultant stress is based on the [[CO2 Scale]] that maps CO2 levels to photosynthetic efficiency.

![[co2_tolerance.png]]

Age related stress is maximum when tree reaches maximum life time age. It increases by a small fixed amount, an aging stress factor = 0.01 every year starting the year at which the tree enters the senescent stage. This attempts to capture decline in health associated with old age.
$$
age \>= age^{max} \Rightarrow Stress_{age} = 1.0
$$
$$
lifeStage = \text{senescent} \Rightarrow Stress_{age} = Stress_{age} + Factor_{stress}^{age} \quad \text{where} \quad Factor_{stress}^{age} = 0.01
$$
When conditions are favourable, trees recover from past stress. Healthier plants (those under less stress) recover faster.  Rate of recovery is determined by a fixed stress recovery factor.
$$
Stress = max(0, Stress - (Factor_{stress}^{recover} \times Health))
$$
$$
\text{where} \quad Factor_{stress}^{recover} = 0.2 \quad \text{and} \quad Health = (1 - Stress)
$$
## Decay

Trees that die naturally, remain on land as dead wood for a while until it decays. This decay releases some carbon back into the air and soil as part of the [[Carbon Cycle]].

## Live

If after considering latest environmental and age related stress, a tree is still alive, the following actions may take place.

<b><u>RECOVERY</u></b>

This is when the tree may recover from stress as mentioned above.

<b><u>GROWTH</u></b>

Physical growth of a tree involves both gaining added volume and gaining maintenance volume. Maintenance volume refers to mass gained to replenish existing volume that is assumed to have been either naturally shed or lost due to damage.

Maintenance volume comprises a certain fixed percent of the existing volume of the tree. 
$$
Volume_{maintenance} = Volume \times Factor_{maintenance}
$$

This $Factor_{maintenance}$ is different for each type of tree such that it is greater for deciduous trees that shed leaves in autumn/winter compared to coniferous ones that are evergreen.
$$
Factor_{maintenance}^{deciduous} = 0.4 \quad \text{and} \quad Factor_{maintenance}^{coniferous} = 0.01
$$
If the tree is yet to reach maximum height, it continues to grow in size (height and diameter). This growth volume is computed as follows. For simplicity, volume of a tree is computed using the "volume of a cylinder" formula.
$$
Volume_{growth} = max(0, Volume_{new} - Volume)
$$
$$
Volume_{new} = \pi \times \left(\frac{Diameter_{new}}{2}\right)^2 \times Height_{new}
$$
$$
\text{Here} \quad Diameter_{new} = min(Diameter_{max}, Diameter + Diameter_{growth})
$$
$$
\text{and} \quad Height_{new} = min(Height_{max}, Height + Height_{growth})
$$
$$
\text{such that} \quad Height_{growth} = GrowthRate\times Height_{growth}^{max}
$$
$$
\text{and } \quad Diameter_{growth} = GrowthRate \times Diameter_{growth}^{max}
$$
Once the tree has reached maximum height, secondary growth takes place. 
$$
Diameter_{new} = Diameter + Diameter_{growth}^{secondary}
$$
$$
Diameter_{growth}^{secondary} = 2 \times \sqrt{\frac{Volume_{growth}^{secondary}}{\pi \times Height}}
$$
$$
Volume_{growth}^{secondary} = Volume_{growth}^{max} \times Factor_{growth}^{secondary}
$$
$$
Where \quad Factor_{growth}^{secondary} = 0.01 \quad and \quad Volume_{growth}^{max} = \pi \times (\frac{Diameter_{growth}^{max}}{2})^2 \times Height_{growth}^{max}   
$$
Growth gets slower as stress is increases. However, since more biodiverse forests are more resilient, the [[Biodiversity]] stress reduction factor can help counter negative effects of stress on growth. 
$$
GrowthRate = (1 - max(0, Stress - Factor_{stress}^{bdRed}))
$$
Maximum growth height per year is based on the age of the tree at the beginning of it's mature stage and how tall it can get. Maximum growth diameter is simply computed based on maximum growth height using the relationship assumed to be $H_{m} = D^{2/3}_{cm} \Rightarrow D_{cm} = H_{m}^{3/2}$ [(X. Chen and D. Brockway, 2017)](https://www.ccsenet.org/journal/index.php/jps/article/view/69956) where height $H_{m}$ is in meters and diameter $D_{cm}$ is in centimetres. Thus, given $H_{m}$, diameter in meters is computed as $D_{m} = \frac{H_{m}^{3/2}}{100}$.
$$
Height_{growth}^{max} = \frac{Height_{max}}{\text{age at the beginning of mature stage}}
$$
$$
Diameter_{growth}^{max} = \frac{(Height_{growth}^{max})^{3/2}}{100}
$$
All volume gained (maintenance and physical growth) leads to carbon sequestration as part of the [[Carbon Cycle]].

<b><u>REPRODUCTION</u></b>

Trees may reproduce every reproduction interval $ReprIvl$ no. of years only if there is a free space adjacent to the tree and the tree is in either the mature or old growth life stage with $Stress \leq Factor_{stress}^{reproduce}$ where $Factor_{stress}^{reproduce} = 0.5$.

The two types of trees have varying of years after which they may reproduce.
$$
ReprIvl^{deciduous} = 1 \text{ year} \quad \text{and} \quad ReprIvl^{coniferous} = 2.5 \text{ years}
$$
Both types of trees can reproduce only if there is at least one free spot adjacent to itself. Most conifers reproduce via cones or rely on wind dispersion while a large no. of deciduous trees produce fruits that appeal to a wide variety of fauna which carry the fruits that they ingest and dispose them further from the parent tree. Biotic means of dispersal (by means of animal carriers) can result in wider seed spread. Thus, deciduous trees can spawn seedlings in 2 more spots 2 steps away from them parent in addition to immediately adjacent positions as can coniferous trees. This is depicted in the image below.

![[adjacent_positions.png]]
