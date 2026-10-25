import * as React from "react";
import { Panel } from "../../common/Panel";
import { MobileTableWrapper } from "../../common/MobileTableWrapper";

/**
 * A chart with the numbers it plots listed underneath it.
 *
 * The reference screen does this on every chart panel — the column chart sits
 * above an "Account Name / License Count" table of the same figures — and it
 * is the right call for two reasons. A chart shows shape and a table shows
 * values, so reading "roughly a third" off an arc is no substitute for
 * "16,673". And a chart is unreadable to a screen reader however carefully it
 * is labelled, whereas the table beside it is just a table.
 *
 * The table is scrollable rather than paged, because it is the same short set
 * the chart drew — paging it would mean the chart and the table disagreed
 * about what they were showing.
 *
 * @param {Object} props
 * @param {string} props.title Panel heading.
 * @param {React.ReactNode} props.chart The chart to render.
 * @param {Array} props.columns MobileTableWrapper column definitions.
 * @param {Array} props.rows The same data the chart was given.
 * @param {(row: any) => string|number} props.rowKey
 * @param {boolean} [props.dense] Forwarded to the inner `MobileTableWrapper` —
 *   reduces body cell padding/font size for a more compact table.
 * @param {"auto"|"center"|"right"} [props.headerAlign] Forwarded to the inner
 *   `MobileTableWrapper` — table-wide default alignment for both header
 *   labels and body cells.
 */
export function ChartWithData({ title, chart, columns, rows, rowKey, emptyMessage = "No data.", dense, headerAlign }) {
  return (
    <Panel title={title}>
      <div className="flex flex-col">
        <div className="p-4 pb-2">{chart}</div>

        {/* Capped so a panel with twenty accounts does not push everything
            below it off the screen — the whole point of this layout is that
            the page stays scannable. */}
        <div className="max-h-56 overflow-y-auto border-t border-card-border">
          <MobileTableWrapper
            columns={columns}
            data={rows}
            rowKey={rowKey}
            serverSide
            emptyMessage={emptyMessage}
            primaryFields={columns.slice(0, 2).map((c) => c.key)}
            dense={dense}
            headerAlign={headerAlign}
          />
        </div>
      </div>
    </Panel>
  );
}
