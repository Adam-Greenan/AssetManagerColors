import styles from "./AssetMenuToolbar.module.css";
import ReactSelect, { MultiValue } from "react-select";
import { AssetMenuRenameConfig } from "../AssetMenuRenameConfig";
import { History, IHistoryProps } from "../../History";
import { AssetAddAsset } from "../AssetAddAsset";
import { Asset } from "../AssetManagerMenu";
import { AssetBulkToolbar } from "../AssetBulkToolbar";

export interface IAssetMenuToolbarProps {
  searchQuery: string;
  onUpdateSearchQuery: (query: string) => void;

  typeFilters: { [key: string]: boolean };
  onUpdateTypeFilter: (type: string, checked: boolean) => void;

  allTags: string[];
  allGroups: string[];
  selectedTags: string[];
  selectedGroups: string[];
  onChangeTags: (tags: string[]) => void;
  onChangeGroups: (groups: string[]) => void;

  onRenameTag: (oldTag: string, newTag: string) => void;
  onRenameGroup: (oldGroup: string, newGroup: string) => void;

  onAddDraftTag: (tag: string) => void;
  onAddDraftGroup: (group: string) => void;
  history: IHistoryProps;

  onAddAsset: (asset: Omit<Asset, "id">) => void;

  onSelectAll: () => void;
  onSelectAllFiltered: () => void;
  onDeselectAll: () => void;
  onDeselectAllFiltered: () => void;
  onDeleteAllSelected: () => void;

  selectedAssetIds: Set<string>;
  onBulkAddTag: (tag: string) => void;
  onBulkRemoveTag: (tag: string) => void;
  onBulkAddGroup: (group: string) => void;
  onBulkRemoveGroup: (group: string) => void;
}
export const AssetMenuToolbar: React.FunctionComponent<
  IAssetMenuToolbarProps
> = ({
  searchQuery,
  onUpdateSearchQuery,
  typeFilters,
  onUpdateTypeFilter,
  allTags,
  allGroups,
  selectedTags,
  selectedGroups,
  onChangeTags,
  onChangeGroups,
  onRenameTag,
  onRenameGroup,
  onAddDraftTag,
  onAddDraftGroup,
  history,
  onAddAsset,
  selectedAssetIds,
  onSelectAll,
  onSelectAllFiltered,
  onDeselectAll,
  onDeselectAllFiltered,
  onDeleteAllSelected,
  onBulkAddTag,
  onBulkRemoveTag,
  onBulkAddGroup,
  onBulkRemoveGroup,
}) => {
  const handleTagChange = (
    newValue: MultiValue<{ label: string; value: string }>
  ) => {
    onChangeTags(newValue.map((v) => v.value));
  };

  const handleGroupChange = (
    newValue: MultiValue<{ label: string; value: string }>
  ) => {
    onChangeGroups(newValue.map((v) => v.value));
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbarSection}>
        <div className={styles.title}>Search & Filters</div>
        <div className={styles.topRow}>
          {/* Search and type filters */}
          <div className={styles.subSection}>
            <div className={styles.selectorLabel}>Fuzzy Search: </div>
            <input
              className={styles.searchInput}
              type="text"
              value={searchQuery}
              onChange={(e) => onUpdateSearchQuery(e.target.value)}
              placeholder="Search assets..."
            />
          </div>

          <div className={styles.subSection}>
            <div className={styles.selectorLabel}>Types: </div>
            <div className={styles.typeFilters}>
              {["Fill", "Gradient", "Pattern"].map((type) => (
                <label key={type} className={styles.typeFilterItem}>
                  <input
                    type="checkbox"
                    checked={!!typeFilters[type]}
                    onChange={(e) => onUpdateTypeFilter(type, e.target.checked)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tags / Groups select */}
        <div className={styles.bottomRow}>
          <div className={styles.selectorContainer}>
            <span className={styles.selectorLabel}>Tags</span>
            <ReactSelect
              isMulti
              value={selectedTags.map((tag) => ({ label: tag, value: tag }))}
              options={allTags.map((tag) => ({ label: tag, value: tag }))}
              onChange={handleTagChange}
              placeholder="Select tags..."
            />
          </div>

          <div className={styles.selectorContainer}>
            <span className={styles.selectorLabel}>Groups</span>
            <ReactSelect
              isMulti
              value={selectedGroups.map((group) => ({
                label: group,
                value: group,
              }))}
              options={allGroups.map((group) => ({
                label: group,
                value: group,
              }))}
              onChange={handleGroupChange}
              placeholder="Select groups..."
            />
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.toolbarSection}>
        <div className={styles.title}>Edit Tags and Groups</div>
        <AssetMenuRenameConfig
          allTags={allTags}
          allGroups={allGroups}
          onRenameTag={onRenameTag}
          onRenameGroup={onRenameGroup}
          onAddDraftTag={onAddDraftTag}
          onAddDraftGroup={onAddDraftGroup}
        />
      </div>

      <div className={styles.divider}></div>

      <div className={`${styles.toolbarSection} ${styles.altBackground}`}>
        <div className={styles.title} style= {{ margin: "0px 8px" }}>Bulk Selection options</div>
        <AssetBulkToolbar
          selectedAssetIds={selectedAssetIds}
          allTags={allTags}
          allGroups={allGroups}
          onSelectAll={onSelectAll}
          onSelectAllFiltered={onSelectAllFiltered}
          onDeselectAll={onDeselectAll}
          onDeselectAllFiltered={onDeselectAllFiltered}
          onBulkAddTag={onBulkAddTag}
          onBulkRemoveTag={onBulkRemoveTag}
          onBulkAddGroup={onBulkAddGroup}
          onBulkRemoveGroup={onBulkRemoveGroup}
          onDeleteAllSelected={onDeleteAllSelected}
        />
      </div>

      <div className={styles.divider}></div>

      <div className={styles.toolbarSection}>
        <AssetAddAsset
          allTags={allTags}
          allGroups={allGroups}
          onAddAsset={onAddAsset}
          lastUsed={{ type: "fill", tags: [], groups: [] }}
        />
      </div>

      <div className={styles.divider}></div>

      <div className={`${styles.toolbarSection} ${styles.altBackground}`}>
        <div className={styles.title}>History + undo</div>
        <History
          history={history.history}
          index={history.index}
          undo={history.undo}
          canUndo={history.canUndo}
          lastAction={history.lastAction}
        />
      </div>
    </div>
  );
};
