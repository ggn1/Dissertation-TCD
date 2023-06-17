# Krimi
This is a fun little project that tries to simulate a microbial life form referred to here, as a 'Krimi'. Krimi $k$, live in an artificial world $W$, where food is randomly available. Kirmi should evolve to employ correct strategies to thrive in this environment over multiple generations.

## 1. Minimum Viable Project
Following are minimum requirements that this project aims to meet.
1. The program must support creation of >=1 Krimi.
2. Each Krimi should be able to move, eat, and multiply.
3. Child Krimi must be able to inherit features from it's parent and evolve.
4. A Krimi cannot live indefinitely, it must eventually die.

## 2. Krimiology
Following are aspects of a Krimi that define it, and possible actions it can perform; thereby, influencing it's behavior. Krimiology is to Krimi as Biology is to real-world organisms.
1. A Krimi's repertoire of actions is limited to (1) `move`, (2) `eat`, (3) `multiply`, and (4) `gene exchange`. Only actions (1) and (2) may be performed out of free will. Action (3) automatically occurs when the Krimi's internal state $K$ meets certain criteria and action (4) occurs when one Krimi comes into contact with a neighboring one.
3. Every action costs the Krimi, some energy.
4. Krimi may perform only 1 action at any given moment in time.
5. Awareness of each Krimi is limited to it's internal state $S$ and immediate surroundings $W_k$ only.
6. Internal state $K$ of a Krimi $k$ is comprised of a chaotic force/energy $K_{ck}$, a stabilizing one $K_{sk}$ and 1 biological clock $K_t$ that keeps track of the no. of time units $t$ that the Krimi $k$ has lived for.
    * Here, <font color="magenta">life</font> is thought of as a system which takes in energy to keep itself from reaching chemical equilibrium (Journey to the Microcosmos, April 2022, [YouTube Video: A Microscopic Tour of Death | Compilation](https://www.youtube.com/watch?v=dMd5PYfTGhU&t=1797s))
    * $K_{ck}$ represents energy or forces embodying the tendency of chemistry to approach equilibrium.
    * $K_{sk}$ represents energy or forces that counters $K_{ck}$, thereby keeping Krimi 'alive'.
7. Energy balance and corresponding consequences within each Krimi across its lifetime is defined as follows.
    * At birth, all Krimi have $T_k = 0$, the same $K_{ck}$ and $K_{sk} > K_{ck}$ by 20%.
    * As long as $K_{sk} >= K_{ck}$, the Krimi lives.
    * After each time step $t$, $K_{sk}$ reduces by 1% of $K_{ck}$ to keep the Krimi alive.
    * Any action performed at time $t$ costs an additional 1% of $K_{ck}$ worth of $K_{sk}$ energy.
    * Each food particle eaten adds the equivalent of 5% of $K_{ck}$ to $K_{sk}$.
    * If $K_{sk} > K_{ck}$ by 50%, then the Krimi multiplies to create 1 child Krimi. Both parent and child are left with $K_{sk} > K_{ck}$ by 20%. The parent however has a greater biological clock value than the child who's biological clock shall be set to 0 at birth.
    * With each time step that the Krimi lives for, value of $K_t$ increases by 1.
    * Energy gained from food is reduced by 1% of what a Krimi would normally get for every 10 time units in $K_t$. This models reduction in efficiency over time of the life sustaining system due to aging. 
    * After 3 time units from the death of a Krimi (when $K_{sk} < K_{ck}$), it gets converted into ($K_{ck}$ at time of death / 5% of $K_{ck}$ at time of birth) no. of food particles that get created at it's last resting position and surrounding areas.

## 3. Krimiverse
Krimiverse refers to the world $W$ where Krimi exist. 

Immediate surroundings $W_k$ of a Krimi $k$ may be visualized as follows, where the Krimi itself, shall always be at position 4 with coordinates $x$ and $y$.  

|0: $x-1$, $y+1$|1: $x$, $y+1$|2: $x+1$, $y+1$|
|---|---|---|
|3: $x-1$, $y$|<font color="magenta">4:</font> $x$, $y$|5: $x$, $y+1$|
|6: $x-1$, $y-1$|7: $x$, $y-1$|8: $x+1$, $y+1$|

Positions 0 to 7 in $W_k$ of a Krimi may be
1. *empty*, 
2. contain *food*, 
3. contain another *Kirmi*, 
4. or be a *dead end* (e.g. when a Krimi has reached the limits of its world $W$, of which $W_k$ is a part). 

A Krimi can eat food only when both it, and the food, are on the same position (4: x,y) in $W_k$.

A Krimi can only move into a position in $W_k$ `if` it is empty `or` contains food `and` does not contain another Krimi `and` is not a dead end.

## 4. Information Representation
`Genome`: Genome of the Krimi shall be a Multi Layer Perceptron (MLP) with 1 input layer, 1 output layer, and 2 hidden layers.

`Input`: Each time the Krimi is to make a decision, it shall receive data regarding its external and internal state ($W_k$, $K_{ck}$, $K_{sk}$, $K_t$) as an array, [$W_k$ (0), $W_k$ (1), $W_k$ (2), $W_k$ (3), $W_k$ (4), $W_k$ (5), $W_k$ (6), $W_k$ (7), $K_{ck}$, $K_{sk}$, $K_t$] where $W_k$ position (x) shall be 
* 0 if empty or
* -1 if dead end or
* food value if food or
* -1 if another Krimi.

`Output`: Output of the genome represents the action that the Krimi shall take based on its internal and external state. This shall be an array [Eat?, x+, y+] where
1. Eat? => 1 if the Krimi is to perform the eat action and 0 if it shall move instead.
2. x+ => value to add to the Krimi's current x position in the world $W$. This may be -1, 0, or 1.
3. y+ => value to add to the Krimi's current y position in the world $W$. This may be -1, 0, or 1.

***Note:** If Eat? == 1, then x+ and y+ are set to 0, since the Krimi can only either eat or move, at a time. The option to take an action becomes unavailable when the Krimi is reproducing.*

`Evolution`: At time $t = 0$, the world is full of food and there exists a population of $N$ Krimi with random weights assigned to each of their genome MLPs. Each time a Krimi makes a decision, some of it's weights get randomly updated. This models mutation in the natural world. Also, when Krimi come within $W_k$ of each other, weights of each of these Krimi get updated to the average value of that of all Krimi within that immediate surrounding.