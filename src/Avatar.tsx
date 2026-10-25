import { initials } from "./speakers";

const MAX_SHOWN = 4;

export function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <span className="avatars" aria-hidden="true">
      {names.slice(0, MAX_SHOWN).map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </span>
  );
}
