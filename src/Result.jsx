export default function Result({ location, onClick }) {
  // Always include name and country, and conditionally include admin levels
  const parts = [location.name];
  if (location.admin3) parts.push(location.admin3);
  if (location.admin2) parts.push(location.admin2);
  if (location.admin1) parts.push(location.admin1);
  parts.push(location.country);

  return (
    <li onClick={onClick} style={{ cursor: "pointer" }}>
      {parts.join(", ")}
    </li>
  );
}
