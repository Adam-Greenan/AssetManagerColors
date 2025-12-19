import * as React from "react";
import "./AssetMenuList.css";
import { Asset } from "../AssetManagerMenu";
import { AssetMenuAsset } from "../AssetMenuAsset";
import { Virtuoso } from "react-virtuoso";

export interface IAssetMenuListProps {
  filteredAssets: Asset[];
  onUpdateAsset: (id: string, newData: Partial<Asset>) => void;
  allTags: string[];
  allGroups: string[];
  onRemoveAsset: (id: string) => void;
  selectedAssetIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export const AssetMenuList: React.FC<IAssetMenuListProps> = ({
  filteredAssets,
  onUpdateAsset,
  allTags,
  allGroups,
  onRemoveAsset,
  selectedAssetIds,
  onToggleSelect,
}) => {
  const [itemsPerRow, setItemsPerRow] = React.useState(3);

  // Adjust items per row based on screen width
  React.useEffect(() => {
    const updateItemsPerRow = () => {
      const width = window.innerWidth;
      if (width >= 2000) setItemsPerRow(3);
      else if (width >= 1500) setItemsPerRow(2);
      else setItemsPerRow(1);
    };
    updateItemsPerRow();
    window.addEventListener("resize", updateItemsPerRow);
    return () => window.removeEventListener("resize", updateItemsPerRow);
  }, []);

  // Break assets into rows
  const rows = React.useMemo(() => {
    const newRows: Asset[][] = [];
    for (let i = 0; i < filteredAssets.length; i += itemsPerRow) {
      newRows.push(filteredAssets.slice(i, i + itemsPerRow));
    }
    return newRows;
  }, [filteredAssets, itemsPerRow]);

  return (
    <Virtuoso
      style={{ height: "100vh", width: "100%" }}
      totalCount={rows.length}
      itemContent={(rowIndex) => {
        const rowAssets = rows[rowIndex];
        return (
          <div style={{ display: "flex", gap: 16, padding: 8 }}>
            {rowAssets.map((asset, colIndex) => {
              const isMiddleColumn = rowAssets.length === 3 && colIndex === 1;
              const isSelected = selectedAssetIds.has(asset.id);
              return (
                <div
                  key={asset.id}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: isSelected ? "#f7b9b8ff" : isMiddleColumn ? "#f5f5f5ff" : "#e6e6e6ff", // middle column gets a different bg
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  <AssetMenuAsset
                    asset={asset}
                    onUpdateAsset={onUpdateAsset}
                    allTags={allTags}
                    allGroups={allGroups}
                    onRemoveAsset={onRemoveAsset}
                    selectedAssetIds={selectedAssetIds}
                    onToggleSelect={onToggleSelect}
                  />
                </div>
              );
            })}
          </div>
        );
      }}
    />
  );
};
