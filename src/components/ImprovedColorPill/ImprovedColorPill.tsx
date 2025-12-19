import * as React from "react";
import cssStyles from "./ImprovedColorPill.module.css";
import Transparent from "../../assets/transparent.jpg";
import { insertSampleBeforeExtension } from "../AdminColorMenus/utils/utils";

interface IImprovedColorPillProps {
  color?: string;
  imgSrc?: string;
  selected?: boolean;
  onClick?: () => void;
}

export const ImprovedColorPill: React.FC<IImprovedColorPillProps> = ({
  color,
  imgSrc,
  selected,
}) => {
  const isMobile = window.innerWidth < 900;

  const source = imgSrc ?? color;

  if (!source) return null;

  let styles: React.CSSProperties = {};

  if (color === "transparent") {
    // Transparent swatch
    styles = {
      backgroundColor: "transparent",
      backgroundImage: `url(${Transparent})`,
      backgroundRepeat: "repeat",
      backgroundSize: isMobile ? "8%" : "3%",
    };
  } else if (source.includes("%") && source.includes("#")) {
    // Gradient
    styles.background = `linear-gradient(${source})`;
  } else if (source.startsWith("http")) {
    // Pattern from URL
    styles.backgroundImage = `url(${insertSampleBeforeExtension(source)})`;
    styles.backgroundColor = "transparent";
    styles.backgroundRepeat = "repeat";
    styles.backgroundSize = isMobile ? "150%" : "50%";
  } else if (source.includes("web/image")) {
    // Odoo swatch pattern
    styles.backgroundImage = `url(${source})`;
  } else if (color?.startsWith("#")) {
    // Regular hex color
    styles.backgroundColor = color;
  }

  return (
    <div className={cssStyles.swatchOuter}>
      <div className={cssStyles.swatchInner}>
        <div className={cssStyles.swatchColor} style={styles} />
      </div>
    </div>
  );
};
