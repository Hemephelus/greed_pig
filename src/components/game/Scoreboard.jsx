import PlayerCard from "./PlayerCard.jsx";

export default function Scoreboard({ players, activePlayerIndex }) {
  return (
    <ul
      aria-label="Scoreboard"
      className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4"
    >
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isActive={player.player_index === activePlayerIndex}
        />
      ))}
    </ul>
  );
}