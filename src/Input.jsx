export default function Input({ location, onChangeLocation }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search for a location..."
        value={location}
        onChange={onChangeLocation}
      />
    </div>
  );
}
