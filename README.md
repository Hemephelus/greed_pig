# Greedy Pig - CSC 419 GROUP 5. 

Improvements such as an enhanced onboarding experience,...

Eghogho Esele,...

David Nnodu 
##Lucky Shield (power-up)

Roll 5 times in a row without rolling a 1 to earn a Lucky Shield. If you later roll a 1 while holding a shield, you choose: use the shield to bank your turn points instead of losing them, or keep the shield for later. Either choice ends your turn.

-Database: supabase/002_lucky_shield.sql stores each player’s streak, shields and pending decision.
-Backend: the server rolls the dice and applies the shield rules (server/src/luckyShield.js) through POST /api/games/:id/roll, /pass and /shield/decision.
-Frontend: the Lucky Shield card shows progress and shields; a popup asks for the shield decision. Start Game creates the game on the server, and every action shows a loading state and a clear error if it fails.