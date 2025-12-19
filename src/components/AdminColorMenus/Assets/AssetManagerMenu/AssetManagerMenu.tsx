import * as React from "react";
import "./AssetManagerMenu.css";
import DummyJSON from "../../../../mocks/odoo_react_config.json";
import { useMemo, useState } from "react";
import { AssetMenuToolbar } from "../AssetMenuToolbar";
import Fuse from "fuse.js";
import { AssetMenuList } from "../AssetMenuList";
import { useHistory } from "../../utils/history/useHistory";

export type AssetType = "fill" | "gradient" | "pattern";
export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  value: string;
  tags: string[];
  groups: string[];
}

type AssetMap = Record<string, Asset>;

export interface IAssetManagerMenuProps {}
export const AssetManagerMenu: React.FunctionComponent<
  IAssetManagerMenuProps
> = (props) => {
  // This editor treats asset changes as commands with undo support, because destructive bulk edits are expensive and data is only persisted on export.
  const { execute, history, undo, canUndo, lastAction, index } = useHistory();

  // Grab and memoize assets from DummyJSON
  const fill = useMemo(() => DummyJSON.colours?.textColors ?? [], []);
  const gradient = useMemo(() => DummyJSON.gradients ?? [], []);
  const pattern = useMemo(() => DummyJSON.patterns ?? [], []);

  const initialAssets = useMemo<AssetMap>(() => {
    const map: AssetMap = {};

    fill.forEach((f, i) => {
      map[`fill-${i}`] = {
        id: `fill-${i}`,
        type: "fill",
        name: f.name,
        value: f.value,
        tags: f.tags ?? [],
        groups: f.groups ?? [],
      };
    });

    gradient.forEach((g, i) => {
      map[`gradient-${i}`] = {
        id: `gradient-${i}`,
        type: "gradient",
        name: g.name,
        value: g.value,
        tags: g.tags ?? [],
        groups: g.groups ?? [],
      };
    });

    pattern.forEach((p, i) => {
      map[`pattern-${i}`] = {
        id: `pattern-${i}`,
        type: "pattern",
        name: p.name,
        value: p.url,
        tags: p.tags ?? [],
        groups: p.groups ?? [],
      };
    });

    return map;
  }, [fill, gradient, pattern]);

  // single source of absolute truth for assets, everything else is dirrived data from this state.
  const [assetsState, setAssetsState] = useState<AssetMap>(initialAssets);

  // filter options state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<Record<string, boolean>>({});

  // list of object assets
  const assetList = useMemo(() => Object.values(assetsState), [assetsState]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
    new Set()
  );

  // third data layer, draft data for making new tags/groups without mutating original until confirmed
  const [draftTags, setDraftTags] = useState<Set<string>>(new Set());
  const [draftGroups, setDraftGroups] = useState<Set<string>>(new Set());

  // all tags and groups available
  const allTags = useMemo(() => {
    const set = new Set<string>();
    assetList.forEach((a) => a.tags.forEach((t) => set.add(t)));
    draftTags.forEach((t) => set.add(t));
    return Array.from(set);
  }, [assetList, draftTags]);

  const allGroups = useMemo(() => {
    const set = new Set<string>();
    assetList.forEach((a) => a.groups.forEach((g) => set.add(g)));
    draftGroups.forEach((g) => set.add(g));
    return Array.from(set);
  }, [assetList, draftGroups]);

  // filtering results before fuzzy search
  const filteredWithoutSearch = useMemo(() => {
    let result = assetList;

    const activeTypes = Object.keys(typeFilters)
      .filter((t) => typeFilters[t])
      .map((t) => t.toLowerCase() as AssetType);

    if (activeTypes.length)
      result = result.filter((a) => activeTypes.includes(a.type));
    if (selectedTags.length)
      result = result.filter((a) =>
        selectedTags.some((t) => a.tags.includes(t))
      );
    if (selectedGroups.length)
      result = result.filter((a) =>
        selectedGroups.some((g) => a.groups.includes(g))
      );

    return result;
  }, [assetList, typeFilters, selectedTags, selectedGroups]);

  // fuse after filtering for quicker speeds
  const fuse = useMemo(() => {
    return new Fuse(
      filteredWithoutSearch.map((a) => ({
        ...a,
        tagsStr: a.tags.join(","),
        groupsStr: a.groups.join(","),
      })),
      { keys: ["name", "tagsStr", "groupsStr", "id"], threshold: 0.3 }
    );
  }, [filteredWithoutSearch]);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return filteredWithoutSearch;
    return fuse.search(searchQuery).map((r) => r.item);
  }, [filteredWithoutSearch, searchQuery, fuse]);

  // updte asset via direct id instead of searching and mutating via map
  const updateAsset = (id: string, newData: Partial<Asset>) => {
    const prevData = assetsState[id];
    const assetName = prevData?.name ?? id; // fallback to ID if no name

    execute({
      label: `Update asset "${assetName}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) => ({
          ...prev,
          [id]: { ...prev[id], ...newData },
        }));
      },
      undo: () => {
        setAssetsState((prev) => ({
          ...prev,
          [id]: prevData,
        }));
      },
    });
  };

  const onRenameTag = (oldTag: string, newTag: string) => {
    const affected: string[] = [];
    const before: Record<string, string[]> = {};

    Object.entries(assetsState).forEach(([id, asset]) => {
      if (asset.tags.includes(oldTag)) {
        affected.push(id);
        before[id] = asset.tags;
      }
    });

    execute({
      label: `Rename tag "${oldTag}" → "${newTag}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              affected.includes(id)
                ? [
                    id,
                    {
                      ...asset,
                      tags: asset.tags.map((t) => (t === oldTag ? newTag : t)),
                    },
                  ]
                : [id, asset]
            )
          )
        );
      },
      undo: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              before[id] ? [id, { ...asset, tags: before[id] }] : [id, asset]
            )
          )
        );
      },
    });
  };

  const onRenameGroup = (oldGroup: string, newGroup: string) => {
    // figure out which assets are affected and store their previous state
    const affected: string[] = [];
    const before: Record<string, string[]> = {};

    Object.entries(assetsState).forEach(([id, asset]) => {
      if (asset.groups.includes(oldGroup)) {
        affected.push(id);
        before[id] = asset.groups;
      }
    });

    if (affected.length === 0) return; // nothing to rename

    execute({
      label: `Rename group "${oldGroup}" → "${newGroup}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              affected.includes(id)
                ? [
                    id,
                    {
                      ...asset,
                      groups: asset.groups.map((g) =>
                        g === oldGroup ? newGroup : g
                      ),
                    },
                  ]
                : [id, asset]
            )
          )
        );
      },
      undo: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              before[id] ? [id, { ...asset, groups: before[id] }] : [id, asset]
            )
          )
        );
      },
    });
  };
  const addDraftTag = (tag: string) => {
    if (allTags.includes(tag) || draftTags.has(tag)) return;

    execute({
      label: `Add draft tag "${tag}"`,
      timestamp: Date.now(),
      do: () => {
        setDraftTags((prev) => new Set(prev).add(tag));
      },
      undo: () => {
        setDraftTags((prev) => {
          const next = new Set(prev);
          next.delete(tag);
          return next;
        });
      },
    });
  };

  const addDraftGroup = (group: string) => {
    if (allGroups.includes(group) || draftGroups.has(group)) return;

    execute({
      label: `Add draft group "${group}"`,
      timestamp: Date.now(),
      do: () => {
        setDraftGroups((prev) => new Set(prev).add(group));
      },
      undo: () => {
        setDraftGroups((prev) => {
          const next = new Set(prev);
          next.delete(group);
          return next;
        });
      },
    });
  };

  const removeAsset = (id: string) => {
    const prevData = assetsState[id];

    execute({
      label: `Remove asset Name: "${prevData.name}" ID: "${id}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      },
      undo: () => {
        setAssetsState((prev) => ({ ...prev, [id]: prevData }));
      },
    });
  };

  const onAddAsset = (newAsset: {
    name: string;
    value: string;
    type: AssetType;
    tags: string[];
    groups: string[];
  }) => {
    const id = `${newAsset.type}-${Date.now()}`; // unique ID
    const assetToAdd: Asset = { id, ...newAsset };

    execute({
      label: `Add asset "${newAsset.name}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) => ({ ...prev, [id]: assetToAdd }));
      },
      undo: () => {
        setAssetsState((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      },
    });
  };

  // bulk toolbar selection handlers
  const selectAll = () => {
    setSelectedAssetIds(new Set(Object.keys(assetsState)));
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredAssets.map((a) => a.id);
    setSelectedAssetIds(new Set(filteredIds));
  };

  const deselectAllFiltered = () => {
    const filteredIds = filteredAssets.map((a) => a.id);
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      filteredIds.forEach((id) => next.delete(id));
      return next;
    });
  }

  const deselectAll = () => {
    setSelectedAssetIds(new Set());
  };

  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // bulk toolbar tag/group handlers
  const onBulkAddTag = (tag: string) => {
    if (!tag) return;
    const affectedIds = Array.from(selectedAssetIds);
    if (affectedIds.length === 0) return;

    const before: Record<string, string[]> = {};
    affectedIds.forEach((id) => {
      before[id] = assetsState[id].tags;
    });

    execute({
      label: `Bulk add tag "${tag}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) => {
              if (!affectedIds.includes(id)) return [id, asset];
              const newTags = asset.tags.includes(tag)
                ? asset.tags
                : [...asset.tags, tag];
              return [id, { ...asset, tags: newTags }];
            })
          )
        );
      },
      undo: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              before[id] ? [id, { ...asset, tags: before[id] }] : [id, asset]
            )
          )
        );
      },
    });
  };

  const onBulkRemoveTag = (tag: string) => {
    const affectedIds = Array.from(selectedAssetIds);
    if (affectedIds.length === 0) return;

    const before: Record<string, string[]> = {};
    affectedIds.forEach((id) => {
      before[id] = assetsState[id].tags;
    });

    execute({
      label: `Bulk remove tag "${tag}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) => {
              if (!affectedIds.includes(id)) return [id, asset];
              return [
                id,
                { ...asset, tags: asset.tags.filter((t) => t !== tag) },
              ];
            })
          )
        );
      },
      undo: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              before[id] ? [id, { ...asset, tags: before[id] }] : [id, asset]
            )
          )
        );
      },
    });
  };

  const bulkAddGroup = (group: string) => {
    if (!group) return;
    const affectedIds = Array.from(selectedAssetIds);
    if (!affectedIds.length) return;

    const before: Record<string, string[]> = {};
    affectedIds.forEach((id) => {
      before[id] = assetsState[id].groups;
    });

    execute({
      label: `Bulk add group "${group}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              affectedIds.includes(id)
                ? [
                    id,
                    {
                      ...asset,
                      groups: asset.groups.includes(group)
                        ? asset.groups
                        : [...asset.groups, group],
                    },
                  ]
                : [id, asset]
            )
          )
        );
      },
      undo: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              before[id] ? [id, { ...asset, groups: before[id] }] : [id, asset]
            )
          )
        );
      },
    });
  };

  const bulkRemoveGroup = (group: string) => {
    if (!group) return;
    const affectedIds = Array.from(selectedAssetIds);
    if (!affectedIds.length) return;

    const before: Record<string, string[]> = {};
    affectedIds.forEach((id) => {
      before[id] = assetsState[id].groups;
    });

    execute({
      label: `Bulk remove group "${group}"`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              affectedIds.includes(id)
                ? [
                    id,
                    {
                      ...asset,
                      groups: asset.groups.filter((g) => g !== group),
                    },
                  ]
                : [id, asset]
            )
          )
        );
      },
      undo: () => {
        setAssetsState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, asset]) =>
              before[id] ? [id, { ...asset, groups: before[id] }] : [id, asset]
            )
          )
        );
      },
    });
  };

  // delete all selected assets
  const onDeleteAllSelected = () => {
    const affectedIds = Array.from(selectedAssetIds);
    if (affectedIds.length === 0) return;

    const before: Record<string, Asset> = {};
    affectedIds.forEach((id) => {
      before[id] = assetsState[id];
    });

    execute({
      label: `Delete ${affectedIds.length} selected assets`,
      timestamp: Date.now(),
      do: () => {
        setAssetsState((prev) => {
          const next = { ...prev };
          affectedIds.forEach((id) => delete next[id]);
          return next;
        });
      },
      undo: () => {
        setAssetsState((prev) => ({ ...prev, ...before }));
      },
    });
  };

  return (
    <>
      <AssetMenuToolbar
        searchQuery={searchQuery}
        onUpdateSearchQuery={setSearchQuery}
        typeFilters={typeFilters}
        onUpdateTypeFilter={(type, checked) =>
          setTypeFilters((prev) => ({ ...prev, [type]: checked }))
        }
        allTags={allTags}
        allGroups={allGroups}
        selectedTags={selectedTags}
        selectedGroups={selectedGroups}
        onChangeTags={setSelectedTags}
        onChangeGroups={setSelectedGroups}
        onRenameTag={onRenameTag}
        onRenameGroup={onRenameGroup}
        onAddDraftTag={addDraftTag}
        onAddDraftGroup={addDraftGroup}
        onAddAsset={onAddAsset}
        selectedAssetIds={selectedAssetIds}
        onSelectAll={selectAll}
        onSelectAllFiltered={selectAllFiltered}
        onDeselectAll={deselectAll}
        onDeselectAllFiltered={deselectAllFiltered}
        onDeleteAllSelected={onDeleteAllSelected}
        onBulkAddTag={onBulkAddTag}
        onBulkRemoveTag={onBulkRemoveTag}
        onBulkAddGroup={bulkAddGroup}
        onBulkRemoveGroup={bulkRemoveGroup}
        history={{ undo, canUndo, lastAction, index, history }}
      />

      <div>
        Filtered: {filteredAssets.length} / {assetList.length}
      </div>

      <AssetMenuList
        filteredAssets={filteredAssets}
        onUpdateAsset={updateAsset}
        allTags={allTags}
        allGroups={allGroups}
        onRemoveAsset={removeAsset}
        selectedAssetIds={selectedAssetIds}
        onToggleSelect={toggleSelectAsset}
      />
    </>
  );
};
