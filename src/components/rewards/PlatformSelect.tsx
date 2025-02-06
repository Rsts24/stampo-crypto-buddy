import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlatformSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const PlatformSelect = ({ value, onChange }: PlatformSelectProps) => {
  return (
    <div className="mt-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select trading platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trading212">Trading 212</SelectItem>
          <SelectItem value="freetrade">Freetrade</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PlatformSelect;