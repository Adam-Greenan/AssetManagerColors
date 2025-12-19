import * as React from "react";
import { useState } from "react";
import styles from "../AssetMenuToolbar/AssetMenuToolbar.module.css";
import ReactSelect from "react-select";

export interface IAssetMenuRenameConfigProps {
  allTags: string[];
  allGroups: string[];
  onRenameTag: (oldTag: string, newTag: string) => void;
  onRenameGroup: (oldGroup: string, newGroup: string) => void;
  onAddDraftTag: (tag: string) => void;
  onAddDraftGroup: (group: string) => void;
}
export const AssetMenuRenameConfig: React.FunctionComponent<
  IAssetMenuRenameConfigProps
> = ({
  allTags,
  allGroups,
  onRenameTag,
  onRenameGroup,
  onAddDraftTag,
  onAddDraftGroup,
}) => {
  const [tagToRename, setTagToRename] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");

  const [groupToRename, setGroupToRename] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const handleRenameTag = () => {
    if (!tagToRename || !newTagName) return;
    if (allTags.includes(newTagName)) {
      alert("Tag already exists!");
      return;
    }
    if (window.confirm(`Rename tag "${tagToRename}" to "${newTagName}"?`)) {
      onRenameTag(tagToRename, newTagName);
      setTagToRename(null);
      setNewTagName("");
    }
  };

  const handleRenameGroup = () => {
    if (!groupToRename || !newGroupName) return;
    if (allGroups.includes(newGroupName)) {
      alert("Group already exists!");
      return;
    }
    if (
      window.confirm(`Rename group "${groupToRename}" to "${newGroupName}"?`)
    ) {
      onRenameGroup(groupToRename, newGroupName);
      setGroupToRename(null);
      setNewGroupName("");
    }
  };

  return (
    <div className={styles.renameConfigWrapper}>
      {/* Tag rename */}
      <div className={styles.renameBlock}>
        <label className={styles.selectorLabel}>Create new tag:</label>
        <div className={styles.addDraftRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Add new tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  onAddDraftTag(value);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
          <button
            className={styles.typeFilterItem}
            onClick={(e) => {
              const input = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              const value = input.value.trim();
              if (value) {
                onAddDraftTag(value);
                input.value = "";
              }
            }}
          >
            Add Draft Tag
          </button>
        </div>

        {/* Rename section */}
        <div className={styles.renameColumns}>
          {/* Left column */}
          <div className={styles.renameColumn}>
            <label className={styles.selectorLabel}>
              Select tag to rename:
            </label>
            <ReactSelect
              className={styles.renameSelect}
              value={
                tagToRename ? { label: tagToRename, value: tagToRename } : null
              }
              onChange={(option) => setTagToRename(option?.value ?? null)}
              options={allTags.map((t) => ({ label: t, value: t }))}
              placeholder="Select a tag..."
              isClearable
            />
          </div>

          {/* Right column */}
          <div className={styles.renameColumn}>
            <input
              className={styles.searchInput}
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <button className={styles.typeFilterItem} onClick={handleRenameTag}>
              Rename Tag
            </button>
          </div>
        </div>
      </div>

      {/* Group rename */}
      <div className={styles.renameBlock}>
        <label className={styles.selectorLabel}>Create new group:</label>
        <div className={styles.addDraftRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Add new group"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  onAddDraftGroup(value);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
          <button
            className={styles.typeFilterItem}
            onClick={(e) => {
              const input = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              const value = input.value.trim();
              if (value) {
                onAddDraftTag(value);
                input.value = "";
              }
            }}
          >
            Add Draft Tag
          </button>
        </div>
        <div className={styles.renameColumns}>
          <div className={styles.renameColumn}>
            <label className={styles.selectorLabel}>
              Select group to rename:
            </label>
            <ReactSelect
              className={styles.renameSelect}
              value={
                groupToRename
                  ? { label: groupToRename, value: groupToRename }
                  : null
              }
              onChange={(option) => setGroupToRename(option?.value ?? null)}
              options={allGroups.map((g) => ({ label: g, value: g }))}
              placeholder="Select a group..."
              isClearable
            />
          </div>

          <div className={styles.renameColumn}>
            <input
              className={styles.searchInput}
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button
              className={styles.typeFilterItem}
              onClick={handleRenameGroup}
            >
              Rename Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
