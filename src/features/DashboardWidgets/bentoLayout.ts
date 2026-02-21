import type { WidgetInstance, WidgetSize } from '@/types/widget';
import { WIDGET_SIZE_GRID_SPAN } from '@/types/widget';

/**
 * A placed widget with explicit grid coordinates.
 */
export interface BentoPlacement {
  col: number;
  colSpan: number;
  instanceId: string;
  row: number;
  rowSpan: number;
}

/**
 * Returns the col/row span for a widget size, clamped to the available columns.
 * At smaller breakpoints (e.g. 2 cols), a `wide` widget (3 cols) gets clamped to 2.
 * `large` (2×2) stays 2×2 when ≥2 cols, collapses to 1×2 at 1 col.
 */
const getSpan = (
  size: WidgetSize,
  totalCols: number,
): { cols: number; rows: number } => {
  const base = WIDGET_SIZE_GRID_SPAN[size];
  return {
    cols: Math.min(base.cols, totalCols),
    rows: base.rows,
  };
};

/**
 * Greedy top-left bin-packing algorithm for bento grid layout.
 *
 * Uses a height-map (one entry per column tracking the next free row)
 * to find the first position where a widget fits without overlapping.
 *
 * The algorithm processes widgets in their user-defined order so
 * drag-reorder in the store is respected.
 */
export const computeBentoLayout = (
  widgets: WidgetInstance[],
  totalCols: number,
): BentoPlacement[] => {
  // heightMap[col] = next free row in that column
  const heightMap = new Array(totalCols).fill(0);
  const placements: BentoPlacement[] = [];

  for (const widget of widgets) {
    const { cols: colSpan, rows: rowSpan } = getSpan(widget.size, totalCols);

    // Find the topmost row where this widget fits
    let bestRow = Infinity;
    let bestCol = 0;

    for (let startCol = 0; startCol <= totalCols - colSpan; startCol++) {
      // The widget occupies columns [startCol, startCol + colSpan).
      // The earliest row it can start is the max height across those columns.
      let rowStart = 0;
      for (let c = startCol; c < startCol + colSpan; c++) {
        rowStart = Math.max(rowStart, heightMap[c]);
      }

      if (rowStart < bestRow) {
        bestRow = rowStart;
        bestCol = startCol;
      }
    }

    // Place the widget
    placements.push({
      col: bestCol,
      colSpan,
      instanceId: widget.instanceId,
      row: bestRow,
      rowSpan,
    });

    // Update the height map for the occupied columns
    for (let c = bestCol; c < bestCol + colSpan; c++) {
      heightMap[c] = bestRow + rowSpan;
    }
  }

  return placements;
};

/**
 * Compute the total rows the grid needs (for setting explicit grid-template-rows).
 */
export const computeGridRows = (placements: BentoPlacement[]): number => {
  if (placements.length === 0) return 0;
  return Math.max(...placements.map((p) => p.row + p.rowSpan));
};
