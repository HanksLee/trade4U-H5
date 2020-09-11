import React from "react";
import { toJS } from "mobx";
import { PriceTick } from "../PriceTick";
import classnames from "classnames/bind";
import styles from "./index.module.scss";
const cx = classnames.bind(styles);
OnePriceItem.displayName = "OnePriceItem";
export default function OnePriceItem({
  thisRouter,
  item,
  currentSymbolType,
  thisStore,
  currentSymbolTypeCode
}) {
  const { product_market, product_details, symbol_display } = item ?? {};
  // console.log("item :>> ", toJS(item));
  const { sell, change, chg } = product_details ?? {};
  return (
    <div
      className="self-select-tr"
      key={item.symbol}
      data-id={item.id}
      onClick={async () => {
        let routeId = currentSymbolType === "自选" ? item.symbol : item.id;
        await thisStore.getCurrentSymbol(routeId);
        thisRouter.navigate(`/market/symbol/${routeId}`, {
          props: {
            // currentSymbol: item,
            currentSymbolType,
            currentSymbolTypeCode,
          },
        });
      }}
    >
      <div className="item-main-info">
        <div className="self-select-name">
          {item?.product_details?.name}
          <p>
            <span className="symbol-type-code">
              {item?.symbol_display?.product_display?.market}
            </span>
            <span className="symbol-code">
              {item?.symbol_display?.product_display?.code}
            </span>
          </p>
        </div>
        <PriceTick sell={sell} change={change} chg={chg} />
      </div>
    </div>
  );
}
