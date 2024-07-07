[(B. Ruff, 2023)](https://www.wikihow.com/Calculate-Partial-Pressure)

It is assumed that CO2 behaves like an ideal gas (a hypothetical gas whose molecules occupy negligible space and have no interactions, and which consequently obeys gas laws exactly [(Oxford Languages)](https://www.google.com/search?client=firefox-b-d&sca_esv=1f8e5c078ce6d86e&sca_upv=1&q=ideal+gas&si=ACC90nytWkp8tIhRuqKAL6XWXX-NzIKwABT1Z9F7WLt40MvNUYIw3BECFn08-HjsRn6yXx6uwFeA3LArTKLD_bUzdR0sHFifMQDQvYMkW1diwuXdd2ivV8I%3D&expnd=1&sa=X&ved=2ahUKEwix6LWijPKGAxV_bEEAHR7CAoEQ2v4IegQIShAT&biw=1088&bih=526&dpr=1.76)).

The partial pressure of the CO2 gas in the liquid (air / water) may be computed as follows.

**STEP 1**: Define the partial pressure equation for the gases.

The constant relationship between Pressure ($atm$) of gas and its Volume $(L)$ is captured by Boyle's law as follows.
$$
k_{pv} = PV \qquad [1]
$$
Similarly, the relationship between Temperature $(K)$ of gas and its Volume $(L)$ is captured by Charle's Law as follows.
$$
k_{vt} = \frac{V}{T} \qquad [2]
$$

These two relationships can be combined into a single one as follows.
$$
PV = kT \qquad [3]
$$
Since dealing with elements (C, O) with very small mass, computations are often in moles. To enable this, equation $[3]$ may be rewritten as $PV = nRT \quad [4]$ where $n$ is the no. of moles of the element of interest (here, CO2) and R is a new constant. 

When volume is in $L$, temperature is in $K$ and pressure is in $atm$, $R = 0.0821 \text{ L atm / K} \quad [5]$.

Dalton’s Law states that the total pressure of a gas mixture is the sum of the pressures of each of the gases in the mixture. That is, $P_{total} = P_1 + P_2 + ... + P_m \quad [6]$ when the mixture contains $m$ gases.

For each partial pressure in Dalton's Law, the ideal gas law from $[4]$ can be re-written as follows.
$$
P_i = \frac{nRT}{V} \qquad [7]
$$
Thus, $P_{total} = \sum_{i=1}^m P_m \quad [8]$ for m gases that make up the mixture.

Here, for simplicity, it is assumed that all the C in air and water are present as CO2. Thus, $P_{total} = P_{CO2}$.

**STEP 2:** Find the number of moles of each gas present in the sample.

The number of moles of a gas = $n_{gas}^{mixture}=\frac{\text{mass of the gas in the mixture}}{\text{molar mass of the gas}} \qquad [9]$. 

Atomic weight of C is approx. 12 and that of O is approx. 16. Thus, molar mass of CO2 = $12 + (2 \times 16) = 44 \qquad [10]$. 

In our microworld, the amount of carbon in the air and water are  $C_{air} = 8e+17 \text{ g} \quad [11]$ and $C_{water} = 1e+18 \text{ g} \quad [12]$. Thus, assuming all carbon in the air and water exists as CO2 for simplicity, the amount of CO2 would be $CO2_{air} = 8e+17 \times 32 = 2.56e+19 \text{ g} \quad [13]$ and $CO2_{water} = 1e+18 \times 32 = 3.2e+19 \text{ g} \qquad [14]$.

Using $[10], [13],$ and $[14]$ in $[9]$, the no. of moles of $CO2$ in air and water would be as follows.
$$
n_{CO2}^{air} = \frac{2.56e+19}{44} \approx 5.82e+17 \text{ mol} \qquad [15]
$$
$$
n_{CO2}^{water} = \frac{3.2e+19}{44} \approx 7.27e+17  \text{ mol} \qquad [16]
$$
The volume of air and water are $V_{air} = 4.2e+18 \text{ m}^3 = 4.2e+21 \text{ L} \quad [17]$ and $V_{water} = 3.6e+16 \text{ m}^3 = 3.6e+19 \text{ L} \quad [18]$ respectively.

In 2023, average global ocean surface temperature $T_{water} \approx 20.5 \text{ °C} = 293.65 \text{ K}\quad [19]$ [(Climate Reanalyzer, 2024)](https://climatereanalyzer.org/clim/sst_daily/). In 2023, average global temperature $T_{air} \approx 15\text{ °C} = 288.15 \text{ K} \quad [20]$ [(Copernicus EU, 2024)](https://climate.copernicus.eu/global-climate-highlights-2023).

**STEP 3:** Plug all values into $[7]$.
$$
P_{CO2}^{air} = \frac{n_{CO2}^{air} \times R \times T_{air}}{V_{air}} = \frac{5.82e+17 \times 0.0821 \times288.15}{4.2e+21} = 0.0033 \text{ L atm/K mol} \qquad [21]
$$
$$
P_{CO2}^{water} = \frac{n_{CO2}^{water} \times R \times T_{water}}{V_{water}} = \frac{7.27e+17 \times 0.0821 \times293.65}{3.6e+19} = 0.49 \text{ L atm/K mol} \qquad [21]
$$