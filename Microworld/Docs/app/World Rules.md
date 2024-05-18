All updates happen per timestep = 1 year.
## Constants

Age
In the simulated world, the maximum life expectancy of a conifer tree is 100 years while that of a deciduous tree is slightly lower at 80 years. <font color="#77cc77">On average conifer trees are more long lived than deciduous ones.</font>

| Stage      | Coniferous Age At Start | Coniferous Duration | Coniferous Age At End | Deciduous Age At Start | Deciduous Duration | Deciduous Age At End |
| ---------- | ----------------------- | ------------------- | --------------------- | ---------------------- | ------------------ | -------------------- |
| Seedling   | 0                       | 4                   | 4                     | 0                      | 3                  | 3                    |
| Sapling    | 4                       | 22                  | 26                    | 3                      | 18                 | 21                   |
| Mature     | 26                      | 34                  | 60                    | 21                     | 26                 | 47                   |
| Old Growth | 60                      | 30                  | 90                    | 47                     | 23                 | 70                   |
| Senescent  | 90                      | 5 - 10              | 95 - 100              | 70                     | 5 - 10             | 75 - 80              |

Biodiversity Reduction Factor $(BD^-)$
* $\text{unforested}=0.0$
* $\text{plantation}=0.01$
* $\text{forest}=0.1$
* $\text{ecosystem}=0.3$

Cost of Management Actions
* $\text{plant}=\text{Bc } 900$ [(A. Nita, 2024)](https://lawnlove.com/blog/cost-to-plant-tree/)
* $\text{fell}=\text{Bc } 1400$ [(Kelly O, 2024)](https://www.onlinetradesmen.ie/Blog/meet-the-expert-tree-removal-services.aspx)

Funds Starting Amount $=\text{Bc }10,000$

Income Sources
* $\text{timber}={\text{starting dependency}=1.0\text{, unit}=\text{kg, price per unit}=\text{Bc }0.3}$ [(B. Korchinski, 2020)](https://www.quora.com/How-much-does-a-ton-of-wood-cost)
* $\text{ntfp}={\text{starting dependency}=0.0\text{, unit}=\text{kg, price per unit}=\text{Bc }14.0}$ [(Tesco Ireland)](https://www.tesco.ie/groceries/en-IE/search?query=honey)
* $\text{hunting and fishing}={\text{starting dependency}=0.0\text{, unit}=\text{permit, price per unit}=\text{Bc }27.0}$ [(Texas Parks & Wildlife Department, 2023)](https://tpwd.texas.gov/huntwild/hunt/public/annual_public_hunting/faq.phtml)
* $\text{ecosystem services}={\text{starting dependency}=0.0\text{, unit}=\text{?, price per unit}=\text{Bc ?}}$

Land Size $=$ 8 rows, 8 columns

Rotation Starting no. of Years $=40$ [(H. V. Hensbergen, K. Shono and J. Cedergren, 2023)](https://openknowledge.fao.org/items/930b98d1-9172-4582-aeb3-0b65be35a5a2)

Temperature Starting Value $\approx10.0 °C$ [(Irelands Blue Book)](https://www.irelands-blue-book.ie/IrishWeather.html)

Timber Usage [(University of Wisconsin, 2020)](https://www3.uwsp.edu/cnr-ap/KEEP/Documents/Activities/Energy%20Fact%20Sheets/FactsAboutWood.pdf)
* $\text{energy}\approx0.5$
* $\text{lumber}\approx0.5$

Time Max $=300$ years

Height to Diameter Ratio ($HDR$)
* $\text{coniferous}=600:6\text{ to }3700:57\text{ cm}\Rightarrow 2150:31.5\approx 68:1\approx1:0.015$ [(T. Nord-Larsen and A. T. Nielsen, 2015)](https://www.researchgate.net/figure/Diameter-and-height-allometry-of-the-6-conifer-species-and-236-trees-included-in-this_fig2_274265546)
* $\text{deciduous}=300:4.456\text{ to }1000:22.28\text{ cm}\Rightarrow650:13=50:1=1:0.02$ [(Deepdale)](https://www.deepdale-trees.co.uk/trees/technical-info.html)

Relative Growth Rate (1 year) [(K. W. Tomlinson et al., 2014)](https://pubmed.ncbi.nlm.nih.gov/24958787/) ($RGR$)
* $\text{coniferous}\approx0.15$
* $\text{deciduous}\approx0.1$

Height
* Starting Height of a Seedling $=16\text{ to }25\text{ cm}\Rightarrow20.0\text{ cm}=0.2\text{ m}$ [Tree Time Services](https://treetimeservices.ca/education/reclamation/seedling-characteristics)
* Max Height
	* $\text{coniferous}\approx(112+20)/2\approx70\text{ m}$ [(Encyclopedia Britannica)](https://www.britannica.com/plant/conifer)
	* $\text{deciduous}\approx(112+20)/2\approx40\text{ m}$ [(N. Moran, 2023)](https://www.dlrcoco.ie/sites/default/files/2023-03/dlr_tree_guide.pdf)

Reproduction Interval
* $\text{coniferous}\approx2.5\text{ years}$ [Wikipedia, Conifer](https://en.wikipedia.org/wiki/Conifer)
* $\text{deciduous}\approx1\text{ year}$

Wood Density [Density of wood – the ultimate guide](https://matmatch.com/learn/property/density-of-wood)
* $\text{coniferous} \approx 600\text{ kg/}m^3$
* $\text{deciduous}\approx700\text{ kg/}m^3$
## Rules

1. Size of the tree at time $t$ can be computed from RGR as follows where $S(t)$ is the final size at time $t$, $S_0$ is the initial size and $RGR$ is the relative growth rate [Wikipedia, Relative Growth Rate](https://en.wikipedia.org/wiki/Relative_growth_rate).
$$
S(t) = S_0 \times e^{RGR \times t}
$$
2. Max age of trees is a random number between its the min and max ages at the end of the senescent life stage of each type of tree.