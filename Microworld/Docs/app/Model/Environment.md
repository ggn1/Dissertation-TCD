The environment is composed of the atmosphere, [[Land]], and carbon reservoirs.

In this microworld, there are 5 carbon reservoirs as follows. Carbon moves between these to simulate a simplified [[Carbon Cycle]].
1. **Soil**: The soil holds carbon in the form of organic material (plant/animal remains, microbes, etc.) or minerals.
2. **Fossil Fuels**: Of all the CO2 locked away in the earth, around 5 to 10000 Gt is present as fossil fuels.  [(H. Riebeek, 2011)](https://earthobservatory.nasa.gov/features/CarbonCycle). In 2023 $36.8 \text{ GtCO2} \approx 10 \text{ GtC}$ was added into the atmosphere year by humans. [(E. Cassidy, 2024)](https://earthobservatory.nasa.gov/images/152519/emissions-from-fossil-fuels-continue-to-rise).
3. **Atmosphere:** The mass of the atmosphere is about 5.1e+18 kg [(NASA)](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) $= \boxed{5.1e+21 \text{ g}}$. Given the mass of carbon (solute) in the air (solution) and the mass of the atmosphere,  concentration of $CO_2$ in parts per million ($PPM$) is computed as $\frac{mass_{solute}}{mass_{solution}} \times 1e+6 = \frac{mass_{co2}}{mass_{air}} \times 1e+6$. The [[CO2 Scale]] categorizes ranges of CO2 concentration in the air into different classes based on its implication on quality of human life after having accounted for associated climatic conditions.
5. **Vegetation**: The plants on land sequester carbon dioxide (CO2) from the atmosphere. Carbon sequestration refers to the process through which CO2 is removed from the atmosphere and held in solid or liquid form. [(Oxford Languages)](https://www.google.com/search?client=firefox-b-d&sca_esv=bd5de69f547e2ef3&sca_upv=1&q=carbon+sequestration&si=ACC90nxFKxGIkEronL_t-_P1vo-ZJsK70JfOsn5CDUyBd0eHsIWlZqvD0F2uzkFaIvtab6wuU-Ql3LONo88jio_hZMU3sjhiLnyiyzb1YjmtriFBRWyuzdI2QtvPuQIPhWzNX5TKIe2s&expn.).
6. **Lumber**: This is a man-made reservoir. It refers to all wood that’s preserved in use (furniture, construction, etc.) and not burned for energy. When we preserve wood, we significantly slow down its breakdown and re-entry into the carbon cycle via natural decay. [(Scion, 2019)](https://www.scionresearch.com/about-us/about-scion/corporate-publications/scion-connections/past-issues-list/scion-connections-issue-34,-december-2019/locking-up-carbon-long-term-in-timber-buildings) [(P. van der Lugt, 2020)](https://www.accoya.com/app/uploads/2020/04/Carbon-Storage-Using-Timber-Products.pdf)

## Carbon Composition

![[carbon_cycle.jpg]] [(H. Riebeek, 2011)](https://earthobservatory.nasa.gov/features/CarbonCycle)

The amount of carbon in 4 key real-world carbon reservoirs that are considered in this microworld as listed below, is based on the composition observed on earth as stated in [(H. Riebeek, 2011)](https://earthobservatory.nasa.gov/features/CarbonCycle).
* Air = 800 GtC.
* Soil = 2300 GtC.
* Vegetation = 550 GtC.
* Fossil Fuels = 10000 GtC.

In order to allow for an initial CO2 concentration that sustains plant growth in the microworld, it was necessary to scale down the amount of carbon in the air from 800 GtC as on earth to 500 GtC. Thus, starting values for amount of carbon in each reservoir in the microworld is based on the following carbon composition that though smaller, follows the same ratios as on earth.
* Air = 500 GtC.
* Soil = $500 \times \frac{2300}{800}=$ 1437.5 GtC.
* Vegetation = $500 \times \frac{550}{800}=$ 343.75 GtC.
* Fossil Fuels = $500 \times \frac{10000}{800}=$ 6250 GtC.

At the initial stage in the simulation, all carbon in soil and vegetation is assumed to be in the air. A plants grow, they capture and store this carbon in themselves and the soil. Thus, starting amount of CO2 in the microworld is as given below.
* Air = $1437.5 + 343.75 + 500$ GtC  = 2281.25 GtC $= 2281.25 \times 1e+15 \approx 2.28e+18$ gC.
* Soil = 0 gC.
* Vegetation = 0 gC.
* Fossil Fuels = 6250 GtC = $6250 \times 1e+15 \approx 6.25e+18$ gC.
* Lumber = 0 gC.
