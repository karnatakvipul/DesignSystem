import * as React from "react";
import { Pagination } from "./Pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: {
    pageSize: 10,
    total: 132,
  },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [page, setPage] = React.useState(1);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

/** `onPageSizeChange` is opt-in — the selector only renders when a consumer passes it. */
export const WithPageSizeSelector = {
  render: (args) => {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    return (
      <Pagination
        {...args}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(next);
          setPage(1);
        }}
      />
    );
  },
};

export const FirstPage = {
  args: { page: 1 },
};

export const LastPage = {
  args: { page: 14, total: 132, pageSize: 10 },
};
