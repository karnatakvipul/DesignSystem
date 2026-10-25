import { RefreshCw, Download, Plus } from "lucide-react";
import { TableToolbar } from "./TableToolbar";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { SearchBox } from "./SearchBox";
import { Pagination } from "./Pagination";
import { ColumnFilterDropdown } from "./ColumnFilterDropdown";

/**
 * The bar above a table: actions at one end, pagination and controls at the
 * other.
 *
 * It is pure layout — two slots, `start` and `end`, with the wrapping and
 * responsive behaviour handled for you. It has no opinion about what goes in
 * them, which is what lets every table screen wear the same bar without
 * inheriting another screen's buttons.
 *
 * Below `sm` the two slots stack, so a crowded toolbar does not squeeze its
 * controls into an unusable row.
 */
const meta = {
  title: "Components/TableToolbar",
  component: TableToolbar,
  tags: ["autodocs"],
  argTypes: {
    start: { control: false, description: "Leading slot — usually search and page-level actions." },
    end: { control: false, description: "Trailing slot — usually pagination and the column chooser." },
    className: { control: "text" },
  },
};

export default meta;

const COLUMNS = [
  { key: "account", label: "ACCOUNT" },
  { key: "name", label: "NAME" },
  { key: "status", label: "STATUS" },
  { key: "amount", label: "AMOUNT" },
];

export const Playground = {
  render: (args) => (
    <TableToolbar
      {...args}
      start={
        <>
          <SearchBox placeholder="Search Data" />
          <Button size="sm" icon={<Plus size={14} />}>
            Add
          </Button>
        </>
      }
      end={
        <>
          <Pagination page={1} pageSize={10} total={120} onPageChange={() => {}} />
          <ColumnFilterDropdown columns={COLUMNS} visible={COLUMNS.map((c) => c.key)} />
        </>
      }
    />
  ),
};

/** Only one slot is required — an `end`-only bar is common on a read-only screen. */
export const EndOnly = {
  render: () => (
    <TableToolbar
      end={
        <>
          <IconButton icon={<RefreshCw size={16} />} label="Reload" />
          <IconButton icon={<Download size={16} />} label="Download" />
          <Pagination page={2} pageSize={10} total={45} onPageChange={() => {}} />
        </>
      }
    />
  ),
};

export const StartOnly = {
  render: () => (
    <TableToolbar
      start={
        <>
          <SearchBox placeholder="Search Data" />
          <Button size="sm" variant="secondary">
            Filters
          </Button>
        </>
      }
    />
  ),
};

/** A crowded bar wraps rather than overflowing. */
export const ManyControls = {
  render: () => (
    <TableToolbar
      start={
        <>
          <SearchBox placeholder="Search Data" />
          <Button size="sm">Edit</Button>
          <Button size="sm" variant="danger">
            Delete
          </Button>
          <Button size="sm" variant="secondary">
            Activate
          </Button>
          <Button size="sm" variant="secondary">
            Deactivate
          </Button>
        </>
      }
      end={
        <>
          <Pagination page={1} pageSize={10} total={120} onPageChange={() => {}} />
          <ColumnFilterDropdown columns={COLUMNS} visible={COLUMNS.map((c) => c.key)} />
        </>
      }
    />
  ),
};

/** Below `sm` the slots stack instead of competing for one row. */
export const StacksOnMobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <TableToolbar
      start={<SearchBox placeholder="Search Data" />}
      end={<Pagination page={1} pageSize={10} total={120} onPageChange={() => {}} />}
    />
  ),
};
