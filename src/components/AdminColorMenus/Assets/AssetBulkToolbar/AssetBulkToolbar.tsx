import * as React from "react";
import styles from "./AssetBulkToolbar.module.css";
import ReactSelect from "react-select";

export interface IAssetBulkToolbarProps {
  selectedAssetIds: Set<string>;
  allTags: string[];
  allGroups: string[];

  onSelectAll: () => void;
  onSelectAllFiltered: () => void;
  onDeselectAll: () => void;
  onDeselectAllFiltered: () => void;

  onBulkAddTag: (tag: string) => void;
  onBulkRemoveTag: (tag: string) => void;
  onBulkAddGroup: (group: string) => void;
  onBulkRemoveGroup: (group: string) => void;
  onDeleteAllSelected: () => void;
}
export const AssetBulkToolbar: React.FunctionComponent<
  IAssetBulkToolbarProps
> = ({
  selectedAssetIds,
  allTags,
  allGroups,
  onSelectAll,
  onSelectAllFiltered,
  onDeselectAll,
  onDeselectAllFiltered,
  onBulkAddTag,
  onBulkRemoveTag,
  onBulkAddGroup,
  onBulkRemoveGroup,
  onDeleteAllSelected,
}) => {
  const [selectedTag, setSelectedTag] = React.useState<{
    label: string;
    value: string;
  } | null>(null);
  const [selectedGroup, setSelectedGroup] = React.useState<{
    label: string;
    value: string;
  } | null>(null);

  const tagOptions = allTags.map((t) => ({ label: t, value: t }));
  const groupOptions = allGroups.map((g) => ({ label: g, value: g }));

  return (
    <div className={styles.bulkToolbar}>
      <div className={styles.selectionControls}>
        <div>
          <button className={styles.button} onClick={onSelectAll}>
            Select all
          </button>
          <button className={styles.button} onClick={onSelectAllFiltered}>
            Select all from filtered
          </button>
        </div>
        <div>
          <button
            className={`${styles.button} ${styles.remove}`}
            onClick={onDeselectAll}
          >
            Deselect all
          </button>
          <button
            className={`${styles.button} ${styles.remove}`}
            onClick={onDeselectAllFiltered}
          >
            Deselect all from filtered
          </button>
        </div>
      </div>

      <div className={styles.bulkControls}>
        <div className={styles.bulkRow}>
          <ReactSelect
            value={selectedTag}
            onChange={(val) => setSelectedTag(val)}
            options={tagOptions}
            placeholder="Select tag..."
            className={styles.select}
          />
          <button
            className={`${styles.button} ${styles.add}`}
            onClick={() => {
              if (selectedTag) {
                onBulkAddTag(selectedTag.value);
                setSelectedTag(null);
              }
            }}
          >
            Add tag
          </button>
          <button
            className={`${styles.button} ${styles.remove}`}
            onClick={() => {
              if (selectedTag) {
                onBulkRemoveTag(selectedTag.value);
                setSelectedTag(null);
              }
            }}
          >
            Remove tag
          </button>
        </div>

        <div className={styles.bulkRow}>
          <ReactSelect
            value={selectedGroup}
            onChange={(val) => setSelectedGroup(val)}
            options={groupOptions}
            placeholder="Select group..."
            className={styles.select}
          />
          <button
            className={`${styles.button} ${styles.add}`}
            onClick={() => {
              if (selectedGroup) {
                onBulkAddGroup(selectedGroup.value);
                setSelectedGroup(null);
              }
            }}
          >
            Add Group
          </button>
          <button
            className={`${styles.button} ${styles.remove}`}
            onClick={() => {
              if (selectedGroup) {
                onBulkRemoveGroup(selectedGroup.value);
                setSelectedGroup(null);
              }
            }}
          >
            Remove group
          </button>
        </div>

        <div className={styles.bulkRow}>
          <button
            className={`${styles.button} ${styles.deleteButton}`}
            onClick={onDeleteAllSelected}
            disabled={selectedAssetIds.size === 0}
          >
            Delete selected
          </button>
        </div>
      </div>
    </div>
  );
};
