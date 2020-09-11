import React from "react";

export default ({ thisRouter, item, currentSymbolType, thisStore ,currentSymbolTypeCode}) => {
  return (
    <div
      className="self-select-tr"
      key={item.symbol}
      data-id={item.id}
      onClick={async () => {
        let routeId = currentSymbolType === '自选' ? item.symbol : item.id;
        await thisStore.getCurrentSymbol(routeId)
        thisRouter.navigate(`/market/symbol/${routeId}`, {
          props: {
            // currentSymbol: item,
            currentSymbolType,
            currentSymbolTypeCode
          },
        });
      }}
    >
      <div className="item-main-info">
        <div className="self-select-name">{item?.product_details?.name}
          <p>
            <span className="symbol-type-code">{item?.product_market}</span>
            <span className="symbol-code">{item?.symbol_display?.product_display?.code}</span>
          </p>
        </div>
        <div
          className={`self-select-buy-sell-block ${
            item?.product_details?.change > 0 && "p-up stock-green"
            } ${item?.product_details?.change < 0 && "p-down stock-red-gif"}`}
        >
          {item?.product_details?.sell}
        </div>
        <div
          className={`self-select-buy-sell-block ${
            item?.product_details?.change > 0 && "p-up stock-green"
            } ${item?.product_details?.change < 0 && "p-down stock-red-gif"}`}
        >
          {item?.product_details?.chg}%
        </div>
      </div>
    </div>
  );
};
