import { Skeleton } from "./Skeleton";
import { SkeletonCard } from "./SkeletonCard";
import { SkeletonTable } from "./SkeletonTable";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["rectangular", "circular", "text"] },
  },
  args: {
    variant: "rectangular",
    className: "h-8 w-40",
  },
};

export default meta;

export const Playground = {};

export const Variants = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="h-10 w-10" />
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="text" className="w-32" />
      </div>
    </div>
  ),
};

export const Card = {
  render: () => <SkeletonCard />,
};

export const Table = {
  render: () => <SkeletonTable rows={4} columns={5} />,
};
