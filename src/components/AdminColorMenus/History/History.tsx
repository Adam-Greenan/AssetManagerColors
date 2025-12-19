import * as React from "react";
import styles from "./History.module.css";
import { HistoryCommand } from "../utils/history/useHistory";

export interface IHistoryProps {
  history: HistoryCommand[];
  index: number;
  undo: () => void;
  canUndo: boolean;
  lastAction: string | null;
}

export const History: React.FunctionComponent<IHistoryProps> = ({
  history,
  index,
  undo,
  canUndo,
  lastAction,
}) => {
  // get last 3 actions, most recent first
  const recentActions = history
    .slice(Math.max(0, index - 2), index + 1)
    .reverse();

  return (
    <div className={styles.historyContainer}>
      <button
        className={styles.typeFilterItem}
        onClick={undo}
        disabled={!canUndo}
        title={lastAction ? `Undo: ${lastAction}` : "Nothing to undo"}
      >
        Undo
      </button>

      <div className={styles.historyPreview}>
        <div className={styles.historyLabel}>Last actions:</div>
        <ul>
          {recentActions.map((cmd, i) => (
            <li key={i}>{cmd.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
