In the underlying model, there are 4 values related to biodiversity as follows.
1. Biodiversity Score $B$.
2. Biodiversity Percent $B\%$.
3. Biodiversity Category $B_{cat}$.
4. Biodiversity Stress Reduction Factor $Factor_{stress}^{bdRed}$.

Larger more mixed forests boast higher biodiversity $B$. [(L. R. Hertzog et. al., 2021)](https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/1365-2664.14013)
* If no trees then biodiversity score $B=0$.
* For each coniferous tree, if there exists a deciduous tree then $B = B + 3$.
* For each remaining coniferous or deciduous tree for which there is another tree of the same type $B = B + 1.5$.
* For each remaining coniferous or deciduous tree for which there is no tree of any type $B = B + 0.5$

Forests with more old growth and mature trees harbour greater biodiversity. Even dead trees (dead wood) contribute towards increased biodiversity (fungi, insects, etc.). [(T. Oijala, 2020)](https://www.metsagroup.com/metsaforest/news-and-publications/blogs/increased-biodiversity-through-mixed-forests/) [(Forestry And Land Scotland, 2020)](https://forestryandland.gov.scot/blog/biodiversity-and-you)
* $B = B + (0.5 \times \text{no. of seedlings})$
* $B = B + (1 \times \text{no. of saplings})$
* $B = B + (2 \times \text{no. of mature trees})$
* $B = B + (3.5 \times \text{old growth trees})$
* $B = B + (1 \times \text{no. of dead trees})$

Ecosystems are more biodiverse than new forests or plantations. [(Forestry And Land Scotland, 2020)](https://forestryandland.gov.scot/blog/biodiversity-and-you)
* Biodiversity percent $B\% = \frac{B}{B_{max}-B_{min}}$ where $B_{max} = (3 \times \text{no. of land positions}) + (3.5 \times \text{no. of land positions})$ and $B_{min} = 0$.
* $0 \leq B\% \lt 0.25 \Rightarrow$ Biodiversity category $B_{cat} = \text{unforested}$
* $0.25 \leq B\% \lt 0.5 \Rightarrow$ $B_{cat} = \text{plantation}$
* $0.5 \leq B\% \lt 0.75 \Rightarrow$ $B_{cat} = \text{forest}$
* $0.75 \le B\% \le 1.0 \Rightarrow$ $B_{cat} = \text{ecosystem}$

| **Class:**              | $\ge 0.75 \text{ and} \lt 1$ | $\ge 0.5 \text{ and} \lt 0.75$ | $\ge 0.25 \text{ and} \lt 0.5$ | $\ge 0 \text{ and} \lt 0.25$ |
| ----------------------- | ---------------------------- | ------------------------------ | ------------------------------ | ---------------------------- |
| **Biodiversity Score:** | Ecosystem                    | Forest                         | Plantation                     | Unforested                   |

Forests with more biodiversity are more resilient [(Ian Thompson, 2009)](https://www.cbd.int/doc/publications/cbd-ts-43-en.pdf).
* $B_{cat} = \text{unforested} \Rightarrow Factor_{stress}^{bdRed} = 0.0$
* $B_{cat} = \text{plantation} \Rightarrow Factor_{stress}^{bdRed} = 0.01$
* $B_{cat} = \text{forest} \Rightarrow Factor_{stress}^{bdRed} = 0.1$
* $B_{cat} = \text{ecosystem} \Rightarrow Factor_{stress}^{bdRed} = 0.3$