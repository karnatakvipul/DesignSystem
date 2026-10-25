import { SkeletonCard } from "./SkeletonCard";

/**
 * The loading placeholder for one `MobileCardList` card — a title, a subtitle,
 * a status pill and two metadata columns.
 *
 * Its shape deliberately mirrors the real card so the layout does not jump
 * when the data lands. Render as many as the page size you are about to show.
 */
const meta = {
  title: "Components/Skeletons/SkeletonCard",
  component: SkeletonCard,
  tags: ["autodocs"],
  argTypes: {
    className: { control: "text", description: "Layout overrides — width, margin, grid placement." },
  },
  render: (args) => (
    <div className="w-80">
      <SkeletonCard {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** What a card list looks like while its first page is in flight. */
export const CardListLoading = {
  render: () => (
    <div className="flex w-80 flex-col gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  ),
};
