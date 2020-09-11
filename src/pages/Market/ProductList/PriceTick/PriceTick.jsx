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

  React.useEffect(() => {
    setIsLightOn(true);
    const id = setTimeout(() => {
      setIsLightOn(false);
    }, 2000);
    return () => {
      clearTimeout(id);
      setIsLightOn(false);
    };
  }, [buy, sell, change, chg]);
  return (
    <>
      <div
        className={cn({
          "self-select-buy-sell-block": true,
          [textClass]: true,
          [lightClass]: isLightOn,
        })}
      >
        {sell}
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
