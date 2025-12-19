import * as React from "react";
import styles from "./AssetAddAsset.module.css";
import ReactSelect from "react-select";
import { Asset, AssetType } from "../AssetManagerMenu";
import { ImprovedColorPill } from "../../../ImprovedColorPill";

export interface IAssetAddAssetProps {
  allTags: string[];
  allGroups: string[];
  onAddAsset: (asset: Omit<Asset, "id">) => void;
  lastUsed: {
    type: AssetType;
    tags: string[];
    groups: string[];
  };
}
export interface IAssetAddAssetProps {
  allTags: string[];
  allGroups: string[];
  onAddAsset: (asset: Omit<Asset, "id">) => void;
}

export const AssetAddAsset: React.FunctionComponent<IAssetAddAssetProps> = ({
  allTags,
  allGroups,
  onAddAsset,
}) => {
  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState("");
  const [value, setValue] = React.useState("");
  const [type, setType] = React.useState<AssetType>("fill");
  const [tags, setTags] = React.useState<string[]>([]);
  const [groups, setGroups] = React.useState<string[]>(["default"]);

  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    if (!name.trim() || !value.trim()) return;
    onAddAsset({ name: name.trim(), value: value.trim(), type, tags, groups });
    setName("");
    setValue("");
    setShow(false);
  };

  const resetValues = () => {
    setName("");
    setValue("");
    setType("fill");
    setTags([]);
    setGroups(["default"]);
  };

  // Close modal on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  return (
    <>
      <button className={styles.addAssetButton} onClick={() => setShow(true)}>
        + Add asset
      </button>

      {show && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} ref={modalRef}>
            <h3>Add New Asset</h3>

            <input
              className={styles.input}
              placeholder="Asset name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
            >
              <option value="fill">Fill</option>
              <option value="gradient">Gradient</option>
              <option value="pattern">Pattern</option>
            </select>

            <ReactSelect
              className={styles.reactSelect}
              isMulti
              value={tags.map((t) => ({ label: t, value: t }))}
              options={allTags.map((t) => ({ label: t, value: t }))}
              onChange={(v) => setTags(v.map((x) => x.value))}
              placeholder="Tags…"
            />

            <ReactSelect
              className={styles.reactSelect}
              isMulti
              value={groups.map((g) => ({ label: g, value: g }))}
              options={allGroups.map((g) => ({ label: g, value: g }))}
              onChange={(v) => setGroups(v.map((x) => x.value))}
              placeholder="Groups…"
            />

            <div className={styles.pillWrapper}>
              <ImprovedColorPill
                color={value}
                imgSrc={value}
                onClick={() => {}}
              />
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.confirmButton} onClick={handleAdd}>
                Add
              </button>
              <button className={styles.resetButton} onClick={resetValues}>
                Reset Values
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShow(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
