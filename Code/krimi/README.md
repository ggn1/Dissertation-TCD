# Krimi
This is a fun little project that tries to simulate a microbial life form referred to here, as a 'Krimi'. Krimi $k$, live in an artificial world $W$, where food is randomly available. Kirmi should evolve to employ correct strategies to thrive in this environment over multiple generations.

## 1. Minimum Viable Project
Following are minimum requirements that this project aims to meet.
1. The program must support creation of >=1 Krimi.
2. Each Krimi should be able to move, eat, and reproduce.
3. Child Krimi must be able to inherit features from it's parent and evolve.
4. A Krimi cannot live indefinitely, it must eventually die.

## 2. Krimiology
Following are aspects of a Krimi that define it, and possible actions it can perform; thereby, influencing it's behavior. Krimiology is to Krimi as Biology is to real-world organisms.
1. A Krimi's repertoire of actions is limited to (1) `move`, (2) `eat` and, (3) `reproduce`. Only actions (1) and (2) may be performed out of free will. Action (3) automatically occurs when the Krimi's internal state $S$ meets certain criteria.
3. Every action costs the Krimi, some energy.
4. Krimi may perform only 1 action at any given moment in time.
5. Awareness of each Krimi is limited to it's internal state $S$ and immediate surroundings $W_k$ only.
6. Internal state $S$ of a Krimi is comprised of 2 counteracting forces/energies (a chaotic force $F_c$ and a stabilizing one $F_s$) and 1 biological clock $T_k$ that counts the no. of time units $t$ that the Krimi has existed for.
    * Here, `life` is thought of as a system which takes in energy to keep itself from reaching chemical equilibrium (Journey to the Microcosmos, April 2022, [YouTube Video: A Microscopic Tour of Death | Compilation](https://www.youtube.com/watch?v=dMd5PYfTGhU&t=1797s))
    * $F_c$ represents energy or forces embodying the tendency of chemistry to approach equilibrium.
    * $F_s$ represents energy or forces that counters $F_c$, thereby keeping Krimi 'alive'.
7. Energy balance and corresponding consequences within each Krimi across its lifetime is defined as follows.
    * At birth, all Krimi have $T_k = 0$, the same $F_c$ and $F_s > F_c$ by 20%.
    * As long as $F_s >= F_c$, the Krimi lives.
    * After each time step $t$, $F_s$ reduces by 1% of $F_c$ to keep the Krimi alive.
    * Any action performed at time $t$ costs an additional 1% of $F_c$ worth of $F_s$ energy.
    * Each food particle eaten adds the equivalent of 5% of $F_c$ to $F_s$.
    * If $F_s > F_c$ by 50%, then the Krimi reproduces to create 1 child Krimi. Both parent and child are left with $F_s > F_c$ by 20%. The parent however has a greater biological clock value than the child who's biological clock shall be set to 0 at birth.
    * With each time step that the Krimi lives for, value of $T_k$ increases by 1.
    * Energy gained from food is reduced by 1% of what a Krimi would normally get for every 10 time units in $T_k$. This models reduction in efficiency over time of the life sustaining system due to aging. 
    * After 3 time units from the death of a Krimi (when $F_s < F_c$), it gets converted into ($F_c$ at time of death / 5% of $F_c$ at time of birth) no. of food particles that get created at it's last resting position and surrounding areas.

## 3. Krimiverse
Krimiverse refers to the world $W$ where Krimi exist. 

Immediate surroundings $W_k$ of a Krimi $k$ may be visualized as follows, where the Krimi itself, shall always be at position 4 with coordinates $x$ and $y$.  

|0: $x-1$, $y+1$|1: $x$, $y+1$|2: $x+1$, $y+1$|
|---|---|---|
|3: $x-1$, $y$|<font color="magenta">4:</font> $x$, $y$|5: $x$, $y+1$|
|6: $x-1$, $y-1$|7: $x$, $y-1$|8: $x+1$, $y+1$|

* Positions `0` to `7` in $W_k$ of a Krimi may be (1) `empty`, (2) contain `food`, (3) contain another `Kirmi`, or (4) be `non-existent`. A situation when a position may be non-existent would be when a Krimi has reached the limits of its entire world `W`, of which `W_k` is a part. 
* A Krimi can eat food only when both it, and the food, are on the same position (4: x,y) in $E$.
* A Krimi can only move into a position in $E$ `if` it is empty `or` contains food `and` does not contain another Krimi `and` is not non-existent.

## 4. Genome of Krimi
TO DO ...