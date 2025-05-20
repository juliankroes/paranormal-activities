![paranormal activities logo](/documentation/paranormal-logo.png)
Paranormal Activities is a multiplatform multiplayer game, inspired by different Jackbox games. Where players can answer prompts on a main screen my using their own phones.

# Game flow
The game flow for paranormal activities is as follows:

![flow diagram host](/documentation/flow-diagram-host.png)
![flow diagram game](/documentation/flow-diagram-game.png)

# Architecture
- The host game uses react.
- The phone web application uses a separate react app.
- The backend uses Deno, and all the data is stored in memory so there is no database involved.

# User stories

| User Story                                                                 | Type              | Priority |
|----------------------------------------------------------------------------|-------------------|----------|
| Als gebruiker kan ik een game starten.                                      | Basis functionaliteit | must     |
| Als gebruiker kan ik basisinstellingen veranderen. (sound, type prompts, max players etc.) | Basis functionaliteit | should   |
| Als gebruiker kan ik op mijn mobiel de webapplicatie opstarten.             | Basis functionaliteit | must     |
| Als gebruiker kan ik de gehoste game joinen met een inlogcode.              | Basis functionaliteit | must     |
| Als gebruiker kan ik mijn naam en profielfoto kiezen en deze in de game terug zien. | Basis functionaliteit | should   |
| Als gebruiker kan ik opnieuw inloggen op dezelfde telefoon, mocht ik het spel per ongeluk verlaten. | Basis functionaliteit | could    |
| Als gebruiker kan ik het spel vanaf mijn mobiel starten als ik de game leader ben. | Basis functionaliteit | should   |
| Als gebruiker kan ik achteraf de winnaar zien met korte highlights vanuit het spel. | Basis functionaliteit | could    |
| Als gebruiker kan ik stemmen op andere spelers.                             | Gameplay          | should   |
| Als gebruiker kan ik een unieke prompt op mijn telefoon zien.               | Gameplay          | must     |
| Als gebruiker kan je dingen typen en versturen.                             | Gameplay          | must     |
| Als gebruiker kan ik op het scherm zien wat andere spelers hebben getyped.  | Gameplay          | must     |
| Als gebruiker kan ik punten verdienen tijdens het spel.                     | Gameplay          | should   |
| Als gebruiker kan ik op mijn telefoon stemmen op de dingen op het scherm.   | Gameplay          | should   |
| Als gebruiker kan ik iedereen zijn punten op het leaderboard zien.          | Gameplay          | should   |


