All updates happen per timestep = 1 year.
## Rules

The only reliable indicator in this world that signals if a tree is dead or alive is `stress`. If `stress >= 1` then and only then is a tree dead.

### Initial World
* When the simulated world is first created, seedlings are planted as per predefined species composition. Then, the forest is left to grow for 300 years. The resulting old growth forest, is the starting forest that the players work with.
* Further, the forest shall be composed of 60% coniferous trees and 40% deciduous trees. [(Department of Agriculture, Food and the Marine, Ireland)](https://assets.gov.ie/267876/499d9f21-751b-4d53-89d6-ed8e8e9efb97.pdf)

### Carbon Cycle
* Let a tree have grown in volume by $\Delta V_t \text{ m}^3$. 
* Let density of the biomass of the tree be $D_t \text{ g/m}^3$.
* Then, the tree's weight should have increased by $\Delta W_t = D_t \times \Delta V_t$.
* Of the total weight of the tree, 57.5% is dry weight. Thus, $\Delta W_t^{dry} = 0.575 \times \Delta W_t$
* The amount of carbon in the new volume of the tree is about half it's dry weight $C_t^a = 0.5 \times \Delta W_t^{dry}$.
* This absorbed carbon will get added to the total amount of carbon in the tree and subtracted from the air. Thus, $C_t = C_t + C_t^a$ and $C_a = C_a - C_t^a$.
* All the while the tree grows, it would also need to replace biomass lost due to damage or natural shedding. Let this increase in volume for maintenance equal 1 % of its total volume $\Delta V_t^m = 0.01 \times V_t$.  Just as before, $\Delta W_t^m = D_t \times \Delta V_t$, $\Delta W_t^{mDry} = 0.575 \times \Delta W_t^m$, $C_t^m = 0.5 \times \Delta W_t^{mDry}$.
* This amount of maintenance carbon is subtracted from the air and added to the soil to emulate  the amount of biomass lost being added into the soil's carbon store. This, $C_a = C_a - C_t^m$ and $C_s = C_s + C_t^m$.
*Decay*
* Once a tree has died and remains on the land, 15% of the carbon stored is released into the atmosphere and soil per year. [(World Economic Forum)](https://www.weforum.org/agenda/2021/09/decaying-forest-wood-carbon-climate-change-co2/) So, let amount of carbon that is lost during decay each year be fixed at $C_t^d = 0.15 \times C_t$ where $t=$ time right before the tree died. Thus, weight of the dead tree lost to decay would be $W_t^d = 2C_t^d$ and consequently, volume would be $V_t^d = \frac{W_t^d}{D_t^d}$. That is, after each year, volume of a dead tree that remains in soil, changes as $V_t = V_t - V_t^d$.
* Of the amount of carbon decayed each year, 35% end up in the soil and 65% is released back into the atmosphere. So, $C_s = C_s \times (0.35 \times C_t^d)$ and $C_a = C_a \times (0.65 \times C_t^d)$. [(~ reddit, 2021)](https://www.reddit.com/r/askscience/comments/phvr8h/where_does_the_co2_absorbed_by_trees_end_up/)
*Soil Release*
* The amount of carbon that the soil releases back into the atmosphere each year is 4.2% of the carbon in the soil $C^r_s = 0.042 \times C_s$. Thus, $C_s = C_s - C_s^r$ and $C_a = C_a + C_s^r$.
*Lumber*
* Trees harvested and used as lumber, lock away the carbon in them.

### Plant Growth

For each tree, 
1. If the tree is alive, then `live()`.
2. Else `decay()`. If decayed volume = 0, then remove tree entity from spot on land.
3. Growth height $GH_t = (1 - max(0, S_t - B^{-})) \times GH_t^{max}$ where $S_t$ is the stress the *stress factor* and $B^{-}$ is the *biodiversity reduction factor*.
4. The relationship between height and diameter of trees in this world is assumed to be $H = D^{2/3} \Rightarrow D = H^{3/2}$ [(X. Chen and D. Brockway, 2017)](https://www.ccsenet.org/journal/index.php/jps/article/view/69956). So, Growth diameter $GD_t = GH_t^{3/2}$.

**Stress**

Living trees are under stress due to environmental conditions (atmospheric 𝐶𝑂2 concentration) and age. If $S_t^{env} > 0$ then $S_t = S_t + S_t^{env}$, where $S_t^{env} = S_t^{co2}$. 

When conditions are favourable, plants recover from past stress. Healthier plants (those under less stress) recover faster. If $S_t^{env} \leq  0 \wedge S_t > 0$ then $S_t = max(0, S_t - S_t^{rec}(1 - S_t))$. Here, $S_t^{rec} =$ a fixed predefined recovery factor $\in [0, 1]$ and $1 - S_t$ is indicative of remaining health.

Impact of stress on very old trees (senescent ones) increase as time passes. If life stage of a tree is "senescent", after each time step some stress due to aging $S_t^{age} = 0.01$ is added to net stress of the tree $S_t = S_t + S_t^{age}$. Once maximum age of this tree is reached, $S_t^{age} = 1.0$ and the tree dies.

Cutting down a tree immediately inflicts maximum stress (1.0) on the tree, causing it to die. In this microworld, a tree dies when and only when $S_t \geq 1.0$.

Forests with more biodiversity, grow faster and can better cope with stress.

### Biodiversity

Larger more mixed forests boast higher biodiversity 𝑏.
* If no trees then biodiversity score $B=0$.
* For each coniferous tree, if there exists a deciduous tree then $B = B + 3$.
* For each remaining coniferous or deciduous tree for which there is another tree of the same type $B = B + 2$.
* For each remaining coniferous or deciduous tree for which there is no tree of any type $B = B + 1$

Forests with more old growth and mature trees harbour greater biodiversity. Even dead trees (dead wood) contribute towards increased biodiversity (fungi, insects, etc.).
* $B = B + (0.5 \times \text{no. of seedlings})$
* $B = B + (0.8 \times \text{no. of saplings})$
* $B = B + (2 \times \text{no. of mature trees})$
* $B = B + (3 \times \text{old growth trees})$
* $B = B + (1 \times \text{no. of dead trees})$

Ecosystems are more biodiverse than new forests or plantations.
* Biodiversity percent $B\% = \frac{B}{B_{max}-B{min}}$ where $B_{max} = 3 \times \text{no. of land positions}$ and $B_{min} = 0$.
* $0 \leq B\% \lt 0.25 \Rightarrow$ Biodiversity category $B_{cat} = \text{unforested}$
* $0.25 \leq B\% \lt 0.5 \Rightarrow$ $B_{cat} = \text{plantation}$
* $0.5 \leq B\% \lt 0.75 \Rightarrow$ $B_{cat} = \text{forest}$
* $0.75 \le B\% \le 1.0 \Rightarrow$ $B_{cat} = \text{ecosystem}$

Forests with more biodiversity, grow faster and can better cope with stress.
* $B_{cat} = \text{unforested} \Rightarrow B^{-} = 0.0$
* $B_{cat} = \text{plantation} \Rightarrow B^{-} = 0.01$
* $B_{cat} = \text{forest} \Rightarrow B^{-} = 0.1$
* $B_{cat} = \text{ecosystem} \Rightarrow B^{-} = 0.3$

### Reproduction
Trees may reproduce every $R_t$ no. of years only if there is a free space adjacent to the tree and the tree is mature/old growth with $S_t \leq 0.5$.

### Volume
For simplicity, the volume of a tree here is assumed to be same as that of a cylinder with the tree's height and diameter. When decaying, it is assumed that only height decreases until 0, after which the tree no longer exists.

### Funds
*Influx*
There are two main types of income sources.
1. **Timber:** Income from timber is obtained as a result of felling trees. User's generate this income by including the "fell action" in their plans.
2. **Non-Timber:** There is more than one type of income from the forest that does not come from timber. This includes the following.
	1. **Non-Timber Forest Products**
		* Income is generated from harvesting and selling mushrooms, berries or honey.
		* Harvesting of NTFP leads to a drop in biodiversity score.
		* Availability shall be modelled using a normal distribution.
		* Availability of this resource (mean of normal distribution) shall be directly proportional to the biodiversity score as well as amount of deadwood in the forest (many mushrooms are saprophytes that thrive on decaying organic matter [(Heart of England Forest, 2020)](https://heartofenglandforest.org/news/5-fungi-spot-forest)).
		* The selling price of all these resources together shall be fixed.
		* Income = availability $\times$ fixed selling price per unit.
		* Available amount of resources shall be drawn from a normal distribution with a set mean $\mu$ and standard deviation $\sigma$ to model how this income stream is not very reliable. 
		* This income stream is dependent on both biodiversity score and amount of deadwood in the forest (mushrooms thrive on deadwood).
		* W.r.t biodiversity percent, the mean of the normal distribution is highest when biodiversity score = 1.0. Thus, $availability_{bd} = Max(0, availability_{max} -  (availability_{max} \times (1 - BD\%)))$
		* Concerning deadwood percent $DW\% =$ no. of spots on land with deadwood / total no. of spots on land, $availability_{dw} = Max(0, availability_{max} -  (availability_{max} \times (1 - DW\%)))$.
		* Final availability shall be $availablity = \frac{availability_{BD} + availability_{DW}}{2}$.
	2. **Recreational Activities**
		* Recreational activities, here shall refer to all activities like forest walking trails, picnicking, biking, horse riding, etc, together.
		* If dependence on this stream is set to a value greater than 0, a minimum amount of fixed capital must be paid to establish this service. 
		* Then, based on the amount of dependence, there shall be annual maintenance costs (greater dependence = greater maintenance cost).
		* The entrance fee per person shall be fixed. 
		* A normal curve shall determine no. of people that visit each year. The mean of this distribution shall be directly dependent on biodiversity score.
		* Income = no. of people that visit $\times$ fee per person.
3. **Ecosystem Services**
	* Income comes from aids/grants allotted to encourage maintenance of forests for the natural services (water/air purification, flood control, etc.) that they provide or for cater towards conservation objectives.
	* This shall be a fixed amount that may be received when a forest's category drops below "forest" classification. If the classification does not change to forest or ecosystem, or drops, in some fixed no. of years after a grant has been received, then this aid is stopped. 
	* This aid is temporary and is intended as support rather than income.
*Outflux*
* Executing management actions (plant/fell) costs a certain amount ($F_{plant}, F_{fell}$). 
* The "recreational activities" income stream has associated initial fixed and annual maintenance costs.
* Every year, a fixed amount $F_{m}$ is deducted to reflect living/maintenance costs.
* For both NTFP & Recreational Activities, maintenance cost shall be scaled by income dependency. This is so that user's do not end up spending a lot on streams they do not wish to depend too much on. That said, as long as there is some dependency on the "recreation" income stream (dependency > 0), initial cost that must be paid to set up infrastructure remains fixed.
### Felling

Felling a tree sparks the following events.
* Felling a tree costs a certain amount of money $F_{fell}$.
* Let 25% (roots (21.3% - [(H. He et. al, 2018)](https://www.researchgate.net/publication/344244004_Allometric_biomass_equations_for_12_tree_species_in_coniferous_and_broadleaved_mixed_forests_Northeastern_China)) + the stump and some foliage + branches) of that tree remains on land while the rest of it is harvested.
* The tree that is harvested, is used.
	* 50% of the tree is used to generate energy. All the carbon in this portion of the tree is immediately released back into the environment.
	* The remaining portion of the harvested tree is used as lumber. The carbon in this portion of the tree is locked away and removed from the world.
### Planting
Planting a tree involves the following.
* Planting a tree costs a certain amount of money which is cheaper than felling a tree $F_{plant}$.
* Tree is added to the land if a free spot is available.
## Constants

### Age
In the simulated world, the maximum life expectancy of a conifer tree is 100 years while that of a deciduous tree is slightly lower at 80 years. On average conifer trees are more long lived than deciduous ones. [(F. Biondi et. al., 2023)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10011738/)

| Stage      | Coniferous Age At Start | Coniferous Duration | Coniferous Age At End | Deciduous Age At Start | Deciduous Duration | Deciduous Age At End |
| ---------- | ----------------------- | ------------------- | --------------------- | ---------------------- | ------------------ | -------------------- |
| Seedling   | 0                       | 4                   | 4                     | 0                      | 3                  | 3                    |
| Sapling    | 4                       | 22                  | 26                    | 3                      | 18                 | 21                   |
| Mature     | 26                      | 34                  | 60                    | 21                     | 26                 | 47                   |
| Old Growth | 60                      | 30                  | 90                    | 47                     | 23                 | 70                   |
| Senescent  | 90                      | 10                  | 100                   | 70                     | 10                 | 80                   |

Air Volume $= 4.2\times10^{18} \text{ m}^3$ [(Quora, 2024)](https://www.quora.com/How-much-m3-is-the-volume-of-air-on-Earth-from-the-ground-to-the-atmosphere)

### Biodiversity
* Biodiversity Categories from Biodiversity Scores.
	* $unforested = [0, 0.25)$
	* $plantation = [0.25, 0.5)$
	* $forest = [0.5, 0.75)$
	* $ecosystem = [0.75, 1.01)$
* Biodiversity Stress Reduction Factor $(BD^-)$
	* $\text{unforested}=0.0$
	* $\text{plantation}=0.01$
	* $\text{forest}=0.1$
	* $\text{ecosystem}=0.3$

### Carbon 
[(S. Rackley, Science Direct, 2023)](https://www.sciencedirect.com/topics/earth-and-planetary-sciences/global-carbon-cycle) 
* $\text{soil} = 1400\text{ GtC} = 1400\times10^{15}\text{ gC}$ (initially 0 GtC)
* $air = 750\text{ GtC} = 750\times10^{15}\text{ gC}$ (initially 2700 GtC)
* $vegetation = 550\text{ GtC} = 550\times10^{15}\text{ gC}$ (initially 0 GtC)
* $\text{fossil fuels} = 10,000\text{ GtC} = 10,000\times10^{15}\text{ gC}$
* $C$ % in in plants $=50\%=0.5$ 
* Annual emissions from fossil fuels starting $=37.15 \text{ GtCO2}=37.15\times10^{15}\text{ gCO2}$ (initially $0\text{ gCO2}$). [(H. Ritchie and M. Roser, 2024)](https://ourworldindata.org/co2-emissions)

| CO2 ppm                   | <200       | 200 - 350 | 350 - 430 | 430 - 700 | 700 - 1200 | 1200 - 1800 | >= 1800    |
| ------------------------- | ---------- | --------- | --------- | --------- | ---------- | ----------- | ---------- |
| Human Life                | Impossible | Best      | Good      | Ok        | Bad        | Very Bad    | Impossible |
| Photosynthesis Efficiency | Impossible | Bad       | Bad       | Ok        | Best       | Good        | Very Bad   |

### Cost of Management Actions
* $\text{plant}=\text{Bc } 277$ [(A. Nita, 2023)](https://lawnlove.com/blog/cost-to-plant-tree/)
* $\text{fell}=\text{Bc } 3000$  [(Grasshopper Services)](https://www.grasshopperservices.ie/tree-removal-cost/). This is the max amount. for the biggest tree. This amount will be multiplied by percent of full growth the tree has reached at the time of chopping. Thus, felling cost = (height of the tree / max height) $\times 3000$.
### Funds
* Starting Amount $=\text{Bc }100,000,000$
### Income Sources
There are currently 3 streams of income.
#### Timber
* $\text{starting dependency} = 0.6 \text{, unit} = \text{kg, price per unit} = \text{Bc } 0.3$ [(B. Korchinski, 2020)](https://www.quora.com/How-much-does-a-ton-of-wood-cost) 
#### Non Timber Forest Products (NTFP)
Assuming forest is of size $8\text{ ha}$.
* ${\text{starting dependency}=0.3\text{, unit}=\text{kg, price per unit}=\text{Bc }14.0}$ [(Tesco Ireland)](https://www.tesco.ie/groceries/en-IE/search?query=honey) (Mean of average store prices for mushrooms, berries and honey.)
* Mushrooms
	* $\mu = 40\text{ kg/ha/year} \times 8 = 320 \text{ kg/year}$
	* $\sigma = 1$
	* Depend on biodiversity.
	* Depends on amount of deadwood in the forest.
* Honey
	* $\mu = 0.0026 \text{ bee colonies/ha/year} \times 8 \text { ha} \times 20 \text{ kg / hive} = 0.416 \text{ kg/year}$.
	* Depends on biodiversity.
* Berries
	* $\mu = 5\text{ kg/year}$
	* Depends on biodiversity.
* $\mu = 325.5\text{ kg/year}$
* $\sigma = 2.5$
* Annual Cost:
	* It takes a person a little over 20 hours to cover one acre by foot [(V. Liu, Quora, 2021)](https://www.quora.com/How-long-does-it-take-a-person-to-walk-an-acre). A hectare is 2.5 acres. 
	* Let an employee take 50 hours to harvest (forage & gather) products (mushrooms, honey, berries) from one acre of forest. Then, to cover one hectare, they would need to work for 125 hours. 
	* If the employee is expected to work for 40 hours a week [(A. Meehan, Aisling Meehan Agriculture Solicitors, Teagasc)](https://www.teagasc.ie/media/website/animals/dairy/2-aisling-meehan-presentation-v2.pdf), then no. of work hours possible in a year is $40 \times 52 = 2080 \text{ hrs}$.
	* If the forest spans 8 ha [(SWS Forestry)](https://swsforestry.ie/why-plant/forestry-facts/) and a worker needs to cover the equivalent of the whole forest 3 times a year for harvests, then they would need to work for $125 \times 8 \times 3 = 3000 \text{ hrs}$. This is more than how much 1 person can work in a year. 
	* So, a pair of people working for 1500 hours a year can cover a 8 ha forest 3 times a year for foraging. 
	* Let there be 20 such pairs of people employed. So, the work force would contain 40 people. This is close to the average no. of people working in forestry in the EU as of numbers from 2021 $\approx 50$ people per ha of forest [(Eurostat, 2023)](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/edn-20230321-1).
	* Thus, amount to be paid to employees per year to harvest NTFPs $= \boxed{\text{Bc }600,000}$.
#### Recreational Activities
* $\text{starting dependency} = 0.1, \text{unit} = \text{people}, \text{price per unit}=\text{Bc 5}$ [(K. Mayor et. al., 2007)](https://www.esri.ie/system/files?file=media/file-uploads/2015-07/WP190.pdf), [(Loughkey)](https://loughkey.ie/admission-prices/) [(Donadea Forest Park)](https://www.coillte.ie/site/donadea-forest-park/)
* Availability of people per year:
	* $\mu = 300$ people/year (close to $\frac{29000000}{808848} \times 8\text{ ha}$) [(Department of Agriculture, Food and the Marine, 2022, Ireland National Forest Inventory)](file:///C:/Users/g_gna/Downloads/246991_0b1fafb5-9475-4955-bbbc-26bd9effb509-3.pdf), [(Department of Agriculture Food and the Marine, 2022, Ireland Forest Statistics)](https://www.teagasc.ie/media/website/crops/forestry/advice/Forest-Statistics-Ireland-2022.pdf)
	* $\sigma=2$
* Costs:
	* One time payment $= \boxed{\text{Bc }240,000}$. (In 2006, restoration of a forest (around 44 has) took about € 8,000,000 [(W. Murphy)](http://www.coford.ie/media/coford/content/publications/projectreports/small-scaleforestryconference/Murphy.pdf). Adjusting for inflation, today (€ 1 in 2006 $\approx$ € 1.3 in 2024), that around € 10,400,000 [(Central Statistics Office, Ireland)](https://visual.cso.ie/?body=entity/cpicalculator). Thus, restoring and establishing recreation facilities in an 8 ha forest today, might cost around $\frac{10.4}{44} \times 1,000,000 =$ € 240,000.)
	* Let no. of people hired to maintain the facility be 30 such that they work for 2000 $hrs$ per week for a pay of $\text{Bc }10$. Then, amount paid for maintenance each year could be around Bc 624,000 (amount paid to employees + amount paid for physical resources  (say 10% of initial fixed investment)). So, maintenance cost per year $= \boxed{\text{Bc } 624,000}$ per year.
#### Ecosystem Services
* $\text{ecosystem services}={\text{starting dependency}=0.1\text{, unit}=\text{ha, price per unit}=\text{Bc 150}}$ [(Teagasc)](https://www.teagasc.ie/crops/forestry/grants/native-woodland-conservation-scheme-2023-2027/)
### Land 
* Size $=$ 6 rows, 6 columns

### Rotation 
* Starting no. of Years $=40$ [(H. V. Hensbergen, K. Shono and J. Cedergren, 2023)](https://openknowledge.fao.org/items/930b98d1-9172-4582-aeb3-0b65be35a5a2)
* Year marks beginning of the rotation.

### Timber Usage
[(University of Wisconsin, 2020)](https://www3.uwsp.edu/cnr-ap/KEEP/Documents/Activities/Energy%20Fact%20Sheets/FactsAboutWood.pdf)
* $\text{energy}\approx0.5$
* $\text{lumber}\approx0.5$

### Time 
* Max $=300$ years

### Growth

Maximum Growth Height (1 year) $GH_t^{max}$
* $\text{coniferous}\approx0.3 \text{ m}$  [(Conifers, Ardcarne Garden Centre)](https://www.ardcarne.ie/products/17/conifers)
* $\text{deciduous}\approx1.8 \text{ m}$ [(BBC Gardeners' World Magazine, 2024)](https://www.gardenersworld.com/plants/fast-growing-trees-to-grow/)

### Tree Dimensions
Height
* Starting Height of a Seedling $=16\text{ to }25\text{ cm}\Rightarrow20.0\text{ cm}=0.2\text{ m}$ [Tree Time Services](https://treetimeservices.ca/education/reclamation/seedling-characteristics)
* Max Height
	* $\text{coniferous}\approx(112+20)/2\approx70\text{ m}$ [(Encyclopedia Britannica)](https://www.britannica.com/plant/conifer)
	* $\text{deciduous}\approx(112+20)/2\approx40\text{ m}$ [(N. Moran, 2023)](https://www.dlrcoco.ie/sites/default/files/2023-03/dlr_tree_guide.pdf)

Diameter
* Although subject to significant variability, a simple good estimate of a relationship between Height and Diameter of a tree is $H \propto D^{2/3}$. [(X. Chen and D. Brockway, 2017)](https://www.ccsenet.org/journal/index.php/jps/article/view/69956) [(D. Brockway, 2017)](https://www.fs.usda.gov/research/news/highlights/relationship-between-tree-height-and-diameter-consistent-across-species-and-ranges) Accounting for a proportionality constant, this may be written as $H = kD^{2/3}$. For simplicity, $k$ may be set to 1, implying a direct relationship without any scaling effect due to the environment, species of tree, etc. Thus, in this microworld the relationship between tree height and diameter is, $H_t = D_t^{2/3} \Rightarrow D_t = H_t^{3/2}$.

### Reproduction Interval
* $\text{coniferous}\approx2.5\text{ years}$ [Wikipedia, Conifer](https://en.wikipedia.org/wiki/Conifer)
* $\text{deciduous}\approx1\text{ year}$ ?

### Wood Density 
[Density of wood – the ultimate guide](https://matmatch.com/learn/property/density-of-wood)
* $\text{coniferous} \approx 600\text{ kg/}m^3$
* $\text{deciduous}\approx700\text{ kg/}m^3$