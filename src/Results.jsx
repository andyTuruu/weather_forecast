import Result from "./Result";

export default function Results({ locations, handleSelection }) {
  return (
    <div>
      {locations.length > 0 && <h2>Choose Your Location</h2>}
      <ul>
        {locations.map((loc) => (
          <Result
            key={loc.id}
            location={loc}
            onClick={() => handleSelection(loc)}
          />
        ))}
      </ul>
    </div>
  );
}
