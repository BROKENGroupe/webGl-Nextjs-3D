import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface MaterialSearchInputProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function MaterialSearchInput({ value, onChange }: MaterialSearchInputProps) {
  return (
    <div className="relative flex items-center w-full max-w-xs">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Buscar material..."
        className="pl-8 pr-2 py-1 border rounded text-sm w-full"
        aria-label="Buscar material"
      />
      <span className="absolute left-2 text-gray-400 pointer-events-none">
        <MagnifyingGlassIcon />
      </span>
    </div>
  );
}