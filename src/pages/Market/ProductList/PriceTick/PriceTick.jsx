import React from "react";
import { toJS } from "mobx";
import classnames from "classnames/bind";
import styles from "./PriceTick.module.scss";
const cx = classnames.bind(styles);
const cn = classnames;
/**
 * sell 卖出报价
 * change 涨跌点数
 * chg 涨跌幅％
 */
export const PriceTick = React.memo(({ buy, sell, change, chg, className }) => {
  const [isLightOn, setIsLightOn] = React.useState(false);
  const lightClass = change > 0 ? "stock-up" : change < 0 ? "stock-down" : null;
  const textClass = change > 0 ? "p-up" : change < 0 ? "p-down" : null;
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // 第一次进页面时不闪灯
      return;
    }
    setIsLightOn(true);
    const id = setTimeout(() => setIsLightOn(false), 1500);
    return () => {
      clearTimeout(id);
      setIsLightOn(false);
    };
  }, [buy, sell, change, chg]);

  return (
    <>
      <div
        className={cn("self-select-buy-sell-block", textClass, {
          [lightClass]: isLightOn,
        })}
      >
        {sell?.toFixed(3)}
      </div>
      <div
        className={cn({
          "self-select-buy-sell-block": true,
          [textClass]: true,
          [lightClass]: isLightOn,
        })}
      >
        {chg}%
      </div>
    </>
  );
});
