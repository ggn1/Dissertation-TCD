The simulation is the master component from which all other components may be reached. It may be considered as the "microworld" itself. Its primary purpose is to coordinate all world elements and initialize the microworld.

The simulation contains the microworld's [[Environment]], and a [[Planner]] to keep track of user generated forest management plans.

The simulation triggers update of the state of all world components in accordance with passage of time and prompts update of the UI to reflect model changes. The smallest unit of time here is "year".

Furthermore, the simulation keeps track of forest resources and manages influx and outflux of [[Money]].