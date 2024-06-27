Income from forests may come in the form of non-timber forest products (NTFPs) like mushrooms, berries or honey.

## Availability

A good number for wild mushroom yield from a European forest can be 44.5 kg/ha/year based on yield from a Spanish forest. [(J.Miina et. al., 2014)](https://star-tree.eu/images/visuals/reader/7_promoting%20wild%20mushroom%20yields.pdf) That is 44.5 kg per 10000 $m^2$ per year = 0.00445 kg/year/$m^2$. Thus, for the1740 $m^2$ micro forest, that's around 7.743 kg/year $\approx$ 8 kg/year.

On average, around 20kg of honey can be harvested from one bee hive per year [(D. Flanagan, Teagasc)](https://www.teagasc.ie/rural-economy/rural-development/diversification/bee-keeping-and-honey-production/). In Europe, density of wild honey bee colonies have been estimated to be around $0.26/km^2$. [(O. D. Visick, F. L. W. Ratnieks, 2023)](https://pubmed.ncbi.nlm.nih.gov/37841222/)  This means there may be around $2.6e-8$ colonies per $m^2$. Thus, a 1740 $m^2$ micro forest can have $4.524e-5$ bee colonies, each outputting 20 kg of honey per year to result in total honey generation of around 9.05e-4 kg/year.

With intensive berry picking, it is possible for a group of people to harvest around $10 \text{ kg}$ of wild berries per year by foraging close to home. [(M. Riedl et. al., 2020)](https://www.mdpi.com/1999-4907/11/10/1114) Based on this, it is assumed that 5 kg of berries are foraged from the forest in the microworld per annum.

Overall, mean total availability of NTFPs may be $13.000905 \text{ kg/year}$. Let this be approximated as $\boxed{14 \text{ kg/year}}$ Availability shall be modelled using a normal distribution. To model unpredictability, the standard deviation of this distribution shall be 2.5.

This income stream is dependent on both biodiversity score and amount of deadwood in the forest (mushrooms thrive on deadwood).
* W.r.t biodiversity percent, the mean of the normal distribution is highest when biodiversity score = 1.0. Thus, $availability_{bd} = Max(0, availability_{max} -  (availability_{max} \times (1 - BD\%)))$
* Concerning deadwood percent $DW\% = \frac{\text{no. of spots on land with deadwood}}{\text{total no. of spots on land}}$, $availability_{dw} = Max(0, availability_{max} -  (availability_{max} \times (1 - DW\%)))$.
* Final availability shall be $availablity = \frac{availability_{BD} + availability_{DW}}{2}$.

## Income

Wild mushrooms can fetch around €80/kg [(Ballyhoura Mountain Mushrooms, 2024)](https://ballyhouramushrooms.ie/store/Wild-Irish-Mushrooms-c87664037).

Wild berries can fetch around €25/kg [(Pacific Wild Pick)](https://pacificwildpick.com/collections/berries)

Wild honey can fetch around €65/kg [(Dublin Honey Killester)](https://dublinhoneykillester.ie/product/pure-irish-honey-killester/).

Thus, price fetched per kg for NTFPs may be $= \boxed{170 \text{ coins/kg/year}}$.

Total income $= \text{weight of NTFPs} \times \text{price per kg}$. 

## Expenditure

It takes a person a little over 20 hours to cover one acre = 4046.86 $m^2$ by foot [(V. Liu, Quora, 2021)](https://www.quora.com/How-long-does-it-take-a-person-to-walk-an-acre). That's about 0.005 hrs per $m^2$.  Thus, covering the 1740.15 $m^2$ of forest land in the microworld would take 1 person around 8.6 hrs.

Let the employee take 15 hours to harvest (forage & gather) products (mushrooms, honey, berries) from 1740.15 $m^2$ of forest. Say, the worker needs to cover the equivalent of the whole forest 3 times a year for harvests, then they would need to work for 45 hrs/year. 

Let there be 2 workers, at a wage of 18 coins per hour [(Salary Expert, June 2024)][https://www.salaryexpert.com/salary/job/forest-worker/ireland], maintenance cost = $2 \times 45 \times 18 = \boxed{1620}$ coins/year.