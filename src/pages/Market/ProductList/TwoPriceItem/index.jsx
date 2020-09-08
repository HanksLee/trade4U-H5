import React from "react";

export default ({ thisRouter, item, currentSymbolType, thisStore }) => {
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
          },
        });
      }}
    >
      <div className="item-main-info">
        <div className="self-select-name">{item?.symbol_display?.name}</div>
        <div
          className={`self-select-buy-sell-block ${
            item?.product_details?.change > 0 && "p-up stock-green"
            } ${item?.product_details?.change < 0 && "p-down stock-red-gif"}`}
        >
          {item?.product_details?.buy}
        </div>
        <div
          className={`self-select-buy-sell-block ${
            item?.product_details?.change > 0 && "p-up stock-green"
            } ${item?.product_details?.change < 0 && "p-down stock-red-gif"}`}
        >
          {item?.product_details?.sell}
        </div>
      </div>
      <div className="item-sub-info">
        <div className="self-select-code">
          {item?.symbol_display?.product_display?.code}
        </div>
        {item?.symbol_display?.type_display === "外汇" && (
          <div className="self-select-spread">
            點差:{item?.symbol_display?.spread}
          </div>
        )}
      </div>
    </div>
  );
};

