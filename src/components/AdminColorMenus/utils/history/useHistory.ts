import { useState, useCallback } from "react";
import { Asset } from "../../Assets/AssetManagerMenu";

export interface HistoryCommand {
  label: string;
  timestamp: number;
  do(): void;
  undo(): void;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryCommand[]>([]);
  const [index, setIndex] = useState(-1);

  const execute = useCallback(
    (command: HistoryCommand) => {
      command.do();
      setHistory((prev) => [...prev.slice(0, index + 1), command]);
      setIndex((i) => i + 1);
    },
    [index]
  );

  const undo = useCallback(() => {
    if (index < 0) return;
    history[index].undo();
    setIndex((i) => i - 1);
  }, [history, index]);

  const canUndo = index >= 0;
  const lastAction = history[index]?.label ?? null;

  return {
    execute,
    undo,
    canUndo,
    lastAction,
    history, // <-- expose this
    index, // <-- expose this
  };
}
