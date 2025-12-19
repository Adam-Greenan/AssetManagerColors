import * as React from "react";
import styles from "./AssetMenuAsset.module.css";
import { Asset } from "../AssetManagerMenu";
import ReactSelect from "react-select";
import { ImprovedColorPill } from "../../../ImprovedColorPill";

export interface IAssetMenuAssetProps {
  asset: Asset;
  onUpdateAsset: (id: string, newData: Partial<Asset>) => void;
  onRemoveAsset: (id: string) => void;

  allTags: string[];
  allGroups: string[];

  selectedAssetIds: Set<string>;
  onToggleSelect: (id: string) => void;
}
export const AssetMenuAsset = React.memo(
  ({
    asset,
    onUpdateAsset,
    onRemoveAsset,
    allTags,
    allGroups,
    selectedAssetIds,
    onToggleSelect,
  }: IAssetMenuAssetProps) => {
    const [editingValue, setEditingValue] = React.useState(false);
    const [newValue, setNewValue] = React.useState(asset.value);

    const [isRenaming, setIsRenaming] = React.useState(false);
    const [newName, setNewName] = React.useState(asset.name);

    const isSelected = selectedAssetIds.has(asset.id);

    const handleConfirmRename = () => {
      const trimmed = newName.trim();
      if (!trimmed) {
        alert("Name cannot be empty");
        return;
      }
      if (trimmed !== asset.name) {
        onUpdateAsset(asset.id, { name: trimmed });
      }
      setIsRenaming(false);
    };

    const handleCancelRename = () => {
      setNewName(asset.name);
      setIsRenaming(false);
    };

    const tagValue = React.useMemo(
      () => asset.tags.map((t) => ({ label: t, value: t })),
      [asset.tags]
    );

    const groupValue = React.useMemo(
      () => asset.groups.map((g) => ({ label: g, value: g })),
      [asset.groups]
    );

    const tagOptions = React.useMemo(
      () => allTags.map((t) => ({ label: t, value: t })),
      [allTags]
    );

    const groupOptions = React.useMemo(
      () => allGroups.map((g) => ({ label: g, value: g })),
      [allGroups]
    );

    return (
      <div
        className={`${styles.assetRow}`}
        onClick={(e) => {
          // avoid toggling when clicking inputs/buttons
          if ((e.target as HTMLElement).closest("input,button,svg")) return;
          onToggleSelect(asset.id);
        }}
      >
        <div className={styles.selectCheckbox}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(asset.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className={styles.mainColumn}>
          {isRenaming ? (
            <div className={styles.renameWrapper}>
              <input
                type="text"
                className={styles.renameInput}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmRename();
                  if (e.key === "Escape") handleCancelRename();
                }}
                autoFocus
              />
              <button
                className={styles.renameButton}
                onClick={handleConfirmRename}
              >
                ✅
              </button>
              <button
                className={styles.renameButton}
                onClick={handleCancelRename}
              >
                ❌
              </button>
            </div>
          ) : (
            <h3
              className={styles.assetName}
              onClick={() => setIsRenaming(true)}
              title="Click to rename"
            >
              {asset.name}
            </h3>
          )}
          <div className={styles.assetName}>ID: {asset.id}</div>

          <div className={styles.meta}>
            <span className={styles.type}>{asset.type}</span>
            {editingValue ? (
              <div className={styles.renameWrapper}>
                <input
                  className={styles.renameInput}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
                <button
                  className={styles.renameButton}
                  onClick={() => {
                    onUpdateAsset(asset.id, { value: newValue });
                    setEditingValue(false);
                  }}
                >
                  ✅
                </button>
                <button
                  className={styles.renameButton}
                  onClick={() => setEditingValue(false)}
                >
                  ❌
                </button>
              </div>
            ) : (
              <div
                className={styles.value}
                onClick={() => setEditingValue(true)}
                title="Click to edit value"
              >
                {asset.value}
              </div>
            )}
          </div>

          <div className={styles.pillWrapper}>
            <ImprovedColorPill
              color={asset.value + ""}
              onClick={() => {}}
              imgSrc={asset.value}
            />
          </div>
        </div>

        <div className={styles.metaColumn}>
          <div className={styles.tagGroup}>
            <span className={styles.label}>Tags</span>
            <div className={styles.list}>
              <ReactSelect
                isMulti
                value={tagValue}
                options={tagOptions}
                onChange={(newValue) => {
                  // only confirm if clearing all and there were multiple tags
                  if (newValue.length === 0 && asset.tags.length > 1) {
                    // user clicked "clear all"
                    const confirmed = window.confirm(
                      "Are you sure you want to remove all tags?"
                    );
                    if (!confirmed) return; // abort clearing
                  }
                  onUpdateAsset(asset.id, {
                    tags: newValue.map((v) => v.value),
                  });
                }}
                placeholder="Add tags…"
              />
            </div>
          </div>

          <div className={styles.tagGroup}>
            <span className={styles.label}>Groups</span>
            <div className={styles.list}>
              <ReactSelect
                isMulti
                value={groupValue}
                options={groupOptions}
                onChange={(newValue) => {
                  // only confirm if clearing all and there were multiple groups
                  if (newValue.length === 0 && asset.groups.length > 1) {
                    // user clicked "clear all"
                    const confirmed = window.confirm(
                      "Are you sure you want to remove all groups?"
                    );
                    if (!confirmed) return; // abort clearing
                  }
                  onUpdateAsset(asset.id, {
                    groups: newValue.map((v) => v.value),
                  });
                }}
                placeholder="Add groups…"
              />
            </div>
          </div>
        </div>
        <div className={styles.removeButtonContainer}>
          <div
            className={styles.removeButton}
            onClick={() => {
              const confirmed = window.confirm(
                `Are you sure you want to remove the asset "${asset.name}"? This action cannot be undone.`
              );
              if (confirmed) {
                onRemoveAsset(asset.id);
              }
            }}
          >
            ×
          </div>
        </div>
      </div>
    );
  }
);
